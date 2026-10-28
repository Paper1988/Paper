import { timingSafeEqual } from 'node:crypto'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { aggregateWeeklyStats } from '@/jobs/weeklyAggregation.js'
import BotStatusHistory from '@/Structures/Schemas/BotStatusHistory.js'
import GuildConfig from '@/Structures/Schemas/GuildConfig.js'
import { Logger } from '@/libs/utils/logger.js'
import fastifyCors from '@fastify/cors'
import Fastify, { type FastifyInstance, type FastifyRequest } from 'fastify'
import { authorizeGuildManager } from './authorization.js'

type RateLimitBucket = { count: number; resetAt: number }

export class ApiServer {
    private fastify: FastifyInstance
    private client: PaperClient
    private rateLimitBuckets = new Map<string, RateLimitBucket>()
    private rateLimitChecks = 0

    constructor(client: PaperClient) {
        this.client = client
        this.fastify = Fastify({ logger: true })
        this.setupCors()
        this.setupAuthentication()
        this.setupRoutes()
    }

    private setupCors() {
        const allowedOrigins = [
            process.env.PAPER_DASHBOARD_URL,
            process.env.GO_API_URL ?? 'http://localhost:8080'
        ].filter((origin): origin is string => Boolean(origin))

        this.fastify.register(fastifyCors, {
            origin: allowedOrigins,
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true
        })
    }

    /** Protect internal endpoints with a server-to-server Bearer secret. */
    private setupAuthentication() {
        this.fastify.addHook('onRequest', async (request, reply) => {
            if (request.method === 'OPTIONS') return

            const path = request.url.split('?')[0] ?? ''
            if (path === '/health' || path === '/api/bot-status') return

            const expectedSecret = process.env.PAPER_API_SECRET
            if (!expectedSecret) {
                this.fastify.log.error('PAPER_API_SECRET is not configured')
                return reply.code(503).send({ message: 'API authentication is not configured' })
            }

            const authorization = request.headers.authorization
            const suppliedSecret =
                typeof authorization === 'string' && authorization.startsWith('Bearer ')
                    ? authorization.slice('Bearer '.length)
                    : ''
            const expected = Buffer.from(expectedSecret)
            const supplied = Buffer.from(suppliedSecret)

            if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
                return reply.code(401).send({ message: 'Unauthorized' })
            }
        })
    }

    /** In-memory limits for this single bot process; no extra dependency required. */
    private rateLimit(max: number, windowMs: number) {
        return async (request: FastifyRequest, reply: any) => {
            const now = Date.now()
            const userId = request.headers['x-discord-id']
            const identity = typeof userId === 'string' ? userId : request.ip
            const route = request.routeOptions.url ?? request.url.split('?')[0] ?? 'unknown'
            const key = `${route}:${identity}`
            const current = this.rateLimitBuckets.get(key)

            if (!current || current.resetAt <= now) {
                this.rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs })
            } else if (current.count >= max) {
                return reply.code(429).send({ message: '請求過於頻繁，請稍後再試' })
            } else {
                current.count += 1
            }

            this.rateLimitChecks += 1
            if (this.rateLimitChecks % 256 === 0) {
                for (const [bucketKey, bucket] of this.rateLimitBuckets) {
                    if (bucket.resetAt <= now) this.rateLimitBuckets.delete(bucketKey)
                }
            }
        }
    }

    private setupRoutes() {
        this.fastify.get('/health', async (_request, reply) => {
            return reply.code(200).send({ status: 'OK', timestamp: new Date().toISOString() })
        })

        this.fastify.get('/api/bot-status', async (_request, reply) => {
            if (this.client.isReady()) {
                return reply.send({
                    status: 'online',
                    username: this.client.user?.tag,
                    guildCount: this.client.guilds.cache.size
                })
            }
            return reply.code(503).send({ status: 'offline', message: '機器人已離線' })
        })

        this.fastify.get(
            '/api/bot-status/history',
            { preHandler: this.rateLimit(60, 60_000) },
            async (request: FastifyRequest<{ Querystring: { hours?: string } }>, reply) => {
                const hours = request.query.hours === undefined ? 24 : Number(request.query.hours)
                if (!Number.isInteger(hours) || hours < 1 || hours > 168) {
                    return reply.code(400).send({ message: 'hours 必須是 1 到 168 之間的整數' })
                }

                try {
                    const since = new Date(Date.now() - hours * 60 * 60 * 1000)
                    const records = await BotStatusHistory.find(
                        { timestamp: { $gte: since } },
                        { _id: 0, timestamp: 1, status: 1 }
                    )
                        .sort({ timestamp: 1 })
                        .lean()

                    return reply.send(
                        records.map((record) => ({
                            timestamp: record.timestamp.toISOString(),
                            status: record.status as 0 | 1
                        }))
                    )
                } catch (error) {
                    this.fastify.log.error(error, '無法讀取機器人狀態歷史')
                    return reply.code(500).send({ message: '無法讀取機器人狀態歷史' })
                }
            }
        )

        this.fastify.get(
            '/api/guilds',
            async (request: FastifyRequest<{ Querystring: { userId?: string } }>, reply) => {
                if (!this.client.isReady()) {
                    return reply.code(503).send({ message: 'Bot is not ready yet.' })
                }

                const userId =
                    (request.headers['x-discord-id'] as string | undefined) ?? request.query.userId
                if (typeof userId !== 'string' || !/^\d{17,20}$/.test(userId)) {
                    return reply.code(400).send({ message: 'userId is required' })
                }

                try {
                    const userGuilds = (
                        await Promise.all(
                            this.client.guilds.cache.map(async (guild) => {
                                if (guild.ownerId === userId) {
                                    return {
                                        id: guild.id,
                                        name: guild.name,
                                        icon: guild.iconURL(),
                                        memberCount: guild.memberCount,
                                        ownerId: guild.ownerId
                                    }
                                }

                                try {
                                    const member =
                                        guild.members.cache.get(userId) ??
                                        (await guild.members.fetch(userId))
                                    if (
                                        !member.permissions.has('Administrator') &&
                                        !member.permissions.has('ManageGuild')
                                    ) {
                                        return null
                                    }

                                    return {
                                        id: guild.id,
                                        name: guild.name,
                                        icon: guild.iconURL(),
                                        memberCount: guild.memberCount,
                                        ownerId: guild.ownerId
                                    }
                                } catch {
                                    return null
                                }
                            })
                        )
                    ).filter((guild) => guild !== null)

                    return reply.send(userGuilds)
                } catch (error) {
                    this.fastify.log.error(error, '抓取伺服器資料失敗')
                    return reply.code(500).send({ message: '抓取伺服器資料失敗' })
                }
            }
        )

        this.fastify.get(
            '/api/guilds/:guildId',
            async (request: FastifyRequest<{ Params: { guildId: string } }>, reply) => {
                const { guildId } = request.params
                if (!(await authorizeGuildManager(this.client, request, reply, guildId))) return
                const guild = this.client.guilds.cache.get(guildId)
                if (!guild) return reply.code(404).send({ message: '在快取中找不到伺服器' })

                return reply.send({
                    id: guild.id,
                    name: guild.name,
                    icon: guild.iconURL(),
                    memberCount: guild.memberCount,
                    ownerId: guild.ownerId,
                    description: guild.description,
                    features: guild.features,
                    preferredLocale: guild.preferredLocale,
                    verificationLevel: guild.verificationLevel,
                    channels: guild.channels.cache.map((channel) => ({
                        id: channel.id,
                        name: channel.name,
                        type: channel.type
                    }))
                })
            }
        )

        this.fastify.get(
            '/api/guilds/:guildId/config',
            async (request: FastifyRequest<{ Params: { guildId: string } }>, reply) => {
                const { guildId } = request.params
                if (!(await authorizeGuildManager(this.client, request, reply, guildId))) return

                try {
                    const config = await GuildConfig.findOne({ guildId }).lean()
                    return reply.send({
                        guildId,
                        disabledCommands: config?.disabledCommands ?? [],
                        availableCommands: this.client.getAvailableConfigCommands()
                    })
                } catch (error) {
                    this.fastify.log.error(error, '讀取伺服器設定失敗')
                    return reply.code(500).send({ message: '讀取伺服器設定失敗' })
                }
            }
        )

        this.fastify.put(
            '/api/guilds/:guildId/config',
            async (
                request: FastifyRequest<{
                    Params: { guildId: string }
                    Body: { disabledCommands?: unknown }
                }>,
                reply
            ) => {
                const { guildId } = request.params
                if (!(await authorizeGuildManager(this.client, request, reply, guildId))) return

                const disabledCommands = request.body?.disabledCommands
                if (
                    !Array.isArray(disabledCommands) ||
                    !disabledCommands.every((command): command is string => typeof command === 'string') ||
                    new Set(disabledCommands).size !== disabledCommands.length
                ) {
                    return reply.code(400).send({ message: 'disabledCommands 必須是無重複字串陣列' })
                }

                const availableCommands = new Set(
                    this.client.getAvailableConfigCommands().map((command) => command.name)
                )
                if (disabledCommands.some((command) => !availableCommands.has(command))) {
                    return reply.code(400).send({ message: '包含無法設定的指令' })
                }

                try {
                    const config = await GuildConfig.findOneAndUpdate(
                        { guildId },
                        { $set: { disabledCommands } },
                        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
                    ).lean()

                    return reply.send({
                        guildId,
                        disabledCommands: config?.disabledCommands ?? [],
                        availableCommands: this.client.getAvailableConfigCommands()
                    })
                } catch (error) {
                    this.fastify.log.error(error, '更新伺服器設定失敗')
                    return reply.code(500).send({ message: '更新伺服器設定失敗' })
                }
            }
        )

        this.fastify.get('/aggregateWeeklyStats', async (_request, reply) => {
            try {
                await aggregateWeeklyStats()
                return reply.code(200).send({ ok: true })
            } catch (error) {
                Logger.error(error as Error)
                return reply.code(500).send({ ok: false, message: '週統計彙整失敗' })
            }
        })

        this.setupGiveawayRoutes()
        this.setupMusicRoutes()
    }

    private setupGiveawayRoutes() {
        type GiveawayParams = { Params: { guildId: string; messageId: string } }

        this.fastify.post<GiveawayParams>(
            '/api/guilds/:guildId/giveaways/:messageId/end',
            { preHandler: this.rateLimit(10, 60_000) },
            async (request, reply) => {
                const { guildId, messageId } = request.params
                if (!(await authorizeGuildManager(this.client, request, reply, guildId))) return

                try {
                    const giveawayManager = (this.client as any).giveawayManager
                    if (!giveawayManager) {
                        return reply.code(501).send({ message: 'Giveaway manager 未初始化' })
                    }

                    const giveaway = giveawayManager.giveaways.get(messageId)
                    if (!giveaway || giveaway.guildId !== guildId) {
                        return reply.code(404).send({ message: '找不到抽獎活動' })
                    }
                    if (giveaway.ended) return reply.code(400).send({ message: '抽獎已結束' })

                    await giveawayManager.end(messageId)
                    return reply.send({ ok: true, message: '抽獎已強制結束' })
                } catch (error) {
                    this.fastify.log.error(error, '結束抽獎失敗')
                    return reply.code(500).send({ message: '結束抽獎失敗' })
                }
            }
        )

        this.fastify.post<GiveawayParams>(
            '/api/guilds/:guildId/giveaways/:messageId/reroll',
            { preHandler: this.rateLimit(10, 60_000) },
            async (request, reply) => {
                const { guildId, messageId } = request.params
                if (!(await authorizeGuildManager(this.client, request, reply, guildId))) return

                try {
                    const giveawayManager = (this.client as any).giveawayManager
                    if (!giveawayManager) {
                        return reply.code(501).send({ message: 'Giveaway manager 未初始化' })
                    }

                    const giveaway = giveawayManager.giveaways.get(messageId)
                    if (!giveaway || giveaway.guildId !== guildId) {
                        return reply.code(404).send({ message: '找不到抽獎活動' })
                    }

                    const winners = await giveawayManager.reroll(messageId)
                    if (!winners) {
                        return reply.code(404).send({ message: '抽獎尚未結束或不存在' })
                    }
                    return reply.send({ ok: true, winners })
                } catch (error) {
                    this.fastify.log.error(error, '重抽失敗')
                    return reply.code(500).send({ message: '重抽失敗' })
                }
            }
        )
    }

    private setupMusicRoutes() {
        type MusicParams = { Params: { guildId: string } }
        const getPlayer = (guildId: string) => this.client.moonlink?.players.get(guildId) ?? null
        const musicLimit = () => this.rateLimit(30, 60_000)

        this.fastify.get<MusicParams>(
            '/api/guilds/:guildId/music/queue',
            { preHandler: musicLimit() },
            async (request, reply) => {
                const { guildId } = request.params
                if (!(await authorizeGuildManager(this.client, request, reply, guildId))) return
                const player = getPlayer(guildId)

                if (!player || !player.playing) return reply.send({ playing: false, tracks: [] })

                return reply.send({
                    playing: true,
                    paused: player.paused,
                    repeatMode: player.loop,
                    volume: player.volume,
                    currentTrack: {
                        title: player.current?.title,
                        url: player.current?.uri,
                        duration: player.current?.duration,
                        thumbnail: player.current?.thumbnail,
                        author: player.current?.author,
                        requestedBy: player.current?.requester?.id
                    },
                    tracks: player.queue.tracks.map((track: any) => ({
                        title: track.title,
                        url: track.url,
                        duration: track.duration,
                        thumbnail: track.thumbnail,
                        author: track.author,
                        requestedBy: track.requestedBy?.id
                    }))
                })
            }
        )

        this.fastify.post<MusicParams>(
            '/api/guilds/:guildId/music/skip',
            { preHandler: musicLimit() },
            async (request, reply) => {
                const { guildId } = request.params
                if (!(await authorizeGuildManager(this.client, request, reply, guildId))) return
                const player = getPlayer(guildId)

                if (!player || !player.playing) return reply.code(400).send({ message: '目前沒有在播放音樂' })
                await player.skip()
                return reply.send({ ok: true })
            }
        )

        this.fastify.post<MusicParams>(
            '/api/guilds/:guildId/music/pause',
            { preHandler: musicLimit() },
            async (request, reply) => {
                const { guildId } = request.params
                if (!(await authorizeGuildManager(this.client, request, reply, guildId))) return
                const player = getPlayer(guildId)

                if (!player || !player.playing) return reply.code(400).send({ message: '目前沒有在播放音樂' })
                if (player.paused) return reply.code(400).send({ message: '音樂已經是暫停狀態' })

                await player.pause()
                return reply.send({ ok: true })
            }
        )

        this.fastify.post<MusicParams>(
            '/api/guilds/:guildId/music/resume',
            { preHandler: musicLimit() },
            async (request, reply) => {
                const { guildId } = request.params
                if (!(await authorizeGuildManager(this.client, request, reply, guildId))) return
                const player = getPlayer(guildId)

                if (!player || !player.playing) return reply.code(400).send({ message: '目前沒有在播放音樂' })
                if (!player.paused) return reply.code(400).send({ message: '音樂沒有在暫停狀態' })

                await player.resume()
                return reply.send({ ok: true })
            }
        )

        this.fastify.delete<MusicParams>(
            '/api/guilds/:guildId/music/queue',
            { preHandler: musicLimit() },
            async (request, reply) => {
                const { guildId } = request.params
                if (!(await authorizeGuildManager(this.client, request, reply, guildId))) return
                const player = getPlayer(guildId)

                if (!player) return reply.code(400).send({ message: '目前沒有在播放音樂' })
                player.destroy()
                return reply.send({ ok: true })
            }
        )
    }

    async start() {
        const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3001
        const host = '0.0.0.0'

        try {
            await this.fastify.listen({ port, host })
            Logger.info(`機器人的 API 伺服器在： ${host}:${port}`)
            Logger.info(`環境： ${process.env.NODE_ENV || 'development'}`)
        } catch (error) {
            this.fastify.log.error(error)
            throw error
        }
    }

    async close(): Promise<void> {
        await this.fastify.close()
    }
}
