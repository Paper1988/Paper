import { timingSafeEqual } from 'node:crypto'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { aggregateWeeklyStats } from '@/jobs/weeklyAggregation.js'
import BotStatusHistory from '@/Structures/Schemas/BotStatusHistory.js'
import GuildConfig from '@/Structures/Schemas/GuildConfig.js'
import { Logger } from '@/libs/utils/logger.js'
import fastifyCors from '@fastify/cors'
import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify'
import { authorizeDJ, authorizeGuildManager, authorizeGuildMember, hasGuildDJRole } from './authorization.js'
import Genius from 'genius-lyrics-axios'
import { cleanGeniusLyrics } from '@/libs/utils/cleanGeniusLyrics.js'

type RateLimitBucket = { count: number; resetAt: number }

export class ApiServer {
    private fastify: FastifyInstance
    private client: PaperClient
    private rateLimitBuckets = new Map<string, RateLimitBucket>()
    private lyricsSearchCache = new Map<string, { expiresAt: number; songs: any[] }>()
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
        return async (request: FastifyRequest, reply: FastifyReply) => {
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
                    const giveawayManager = (this.client as any).giveawaysManager
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
                    const giveawayManager = (this.client as any).giveawaysManager
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
        type MusicLyricsParams = { Params: { guildId: string }; Querystring: { index?: string; url?: string } }
        const getPlayer = (guildId: string) => this.client.moonlink?.players.get(guildId) ?? null
        const musicLimit = () => this.rateLimit(30, 60_000)

        // Batch playback status so the dashboard does not poll every guild queue.
        this.fastify.get(
            '/api/music/servers',
            { preHandler: this.rateLimit(30, 60_000) },
            async (request, reply) => {
                const userId = request.headers['x-discord-id']
                if (typeof userId !== 'string' || !/^\d{17,20}$/.test(userId)) {
                    return reply.code(401).send({ message: '使用者身分無效或缺失' })
                }
                if (!this.client.isReady()) {
                    return reply.code(503).send({ message: '機器人尚未上線' })
                }

                const playingGuildIds = (
                    await Promise.all(
                        this.client.guilds.cache.map(async (guild) => {
                            try {
                                const member =
                                    guild.members.cache.get(userId) ??
                                    (await guild.members.fetch(userId))
                                if (!member) return null

                                const player = getPlayer(guild.id)
                                return player?.playing ? guild.id : null
                            } catch {
                                return null
                            }
                        })
                    )
                ).filter((guildId): guildId is string => guildId !== null)

                return reply.send({ playingGuildIds })
            }
        )

        this.fastify.get<MusicParams>(
            '/api/guilds/:guildId/music/queue',
            { preHandler: musicLimit() },
            async (request, reply) => {
                const { guildId } = request.params
                if (!(await authorizeGuildMember(this.client, request, reply, guildId))) return
                const userId = request.headers['x-discord-id'] as string
                const canControl = await hasGuildDJRole(this.client, guildId, userId)
                const player = getPlayer(guildId)

                if (!player || !player.playing) return reply.send({ playing: false, tracks: [], canControl })

                return reply.send({
                    playing: true,
                    canControl,
                    paused: player.paused,
                    position: player.position,
                    repeatMode: player.loop,
                    volume: player.volume,
                    autoPlay: player.autoPlay,
                    queueLength: player.queue.tracks.length,
                    previousAvailable: player.previous.length > 0,
                    currentTrack: {
                        title: player.current?.title,
                        url: player.current?.uri,
                        duration: player.current?.duration,
                        position: player.current?.position,
                        thumbnail: player.current?.thumbnail,
                        author: player.current?.author,
                        requestedBy: player.current?.requester?.id,
                        isStream: player.current?.isStream,
                        playbackSource: player.get<string>('mirroredSourceName')
                    },
                    tracks: player.queue.tracks.slice(0, 10).map((track: any) => ({
                        title: track.title,
                        url: track.uri ?? track.url,
                        duration: track.duration,
                        thumbnail: track.thumbnail,
                        author: track.author,
                        requestedBy: track.requester?.id ?? track.requestedBy?.id
                    }))
                })
            }
        )

        this.fastify.post<MusicParams & { Body: { from?: unknown; to?: unknown; expectedTracks?: unknown } }>(
            '/api/guilds/:guildId/music/reorder',
            { preHandler: musicLimit() },
            async (request, reply) => {
                const { guildId } = request.params
                if (!(await authorizeDJ(this.client, request, reply, guildId))) return

                const player = getPlayer(guildId)
                if (!player?.playing || !player.current) {
                    return reply.code(409).send({ message: '目前沒有正在播放的音樂' })
                }

                const { from, to, expectedTracks } = request.body ?? {}
                const tracks = player.queue.tracks
                const visibleCount = Math.min(tracks.length, 10)

                if (
                    typeof from !== 'number' ||
                    !Number.isInteger(from) ||
                    typeof to !== 'number' ||
                    !Number.isInteger(to) ||
                    from < 0 ||
                    to < 0 ||
                    from >= visibleCount ||
                    to >= visibleCount ||
                    from === to ||
                    !Array.isArray(expectedTracks) ||
                    expectedTracks.length !== visibleCount ||
                    !expectedTracks.every((track): track is { url: string; title: string; duration: number } =>
                        typeof track === 'object' &&
                        track !== null &&
                        typeof track.url === 'string' &&
                        typeof track.title === 'string' &&
                        typeof track.duration === 'number'
                    )
                ) {
                    return reply.code(400).send({ message: '播放佇列排序資料無效' })
                }

                const currentSnapshot = tracks.slice(0, visibleCount)
                const isCurrentQueue = currentSnapshot.every((track, index) => {
                    const expected = expectedTracks[index]
                    return (track.uri ?? track.url ?? '') === expected.url &&
                        (track.title ?? '') === expected.title &&
                        (track.duration ?? 0) === expected.duration
                })

                if (!isCurrentQueue) {
                    return reply.code(409).send({ message: '播放佇列已更新，請重新整理後再試' })
                }

                if (!player.queue.move(from, to)) {
                    return reply.code(409).send({ message: '無法更新播放順序，請重新整理後再試' })
                }

                return reply.send({
                    ok: true,
                    queueLength: tracks.length,
                    tracks: tracks.slice(0, visibleCount).map((track) => ({
                        title: track.title,
                        url: track.uri ?? track.url,
                        duration: track.duration,
                        thumbnail: track.thumbnail,
                        author: track.author
                    }))
                })
            }
        )

        this.fastify.post<MusicParams & { Body: { position?: number } }>(
            '/api/guilds/:guildId/music/seek',
            { preHandler: musicLimit() },
            async (request, reply) => {
                const { guildId } = request.params
                if (!(await authorizeDJ(this.client, request, reply, guildId))) return

                const player = getPlayer(guildId)
                const position = request.body?.position
                const track = player?.current

                if (!player?.playing || !track) {
                    return reply.code(409).send({ message: '目前沒有正在播放的音樂' })
                }
                if (
                    track.isStream ||
                    typeof track.duration !== 'number' ||
                    !Number.isFinite(track.duration) ||
                    track.duration <= 0
                ) {
                    return reply.code(400).send({ message: '直播或無法定位的曲目不能調整進度' })
                }
                if (
                    typeof position !== 'number' ||
                    !Number.isFinite(position) ||
                    !Number.isInteger(position) ||
                    position < 0 ||
                    position > track.duration
                ) {
                    return reply.code(400).send({ message: 'position 必須是歌曲長度內的毫秒整數' })
                }

                try {
                    await player.seek(position)
                    return reply.send({ ok: true, position })
                } catch (error) {
                    this.fastify.log.error(error, '調整音樂進度失敗')
                    return reply.code(500).send({ message: '調整音樂進度失敗' })
                }
            }
        )

        this.fastify.post<MusicParams>(
            '/api/guilds/:guildId/music/skip',
            { preHandler: musicLimit() },
            async (request, reply) => {
                const { guildId } = request.params
                if (!(await authorizeDJ(this.client, request, reply, guildId))) return
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
                if (!(await authorizeDJ(this.client, request, reply, guildId))) return
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
                if (!(await authorizeDJ(this.client, request, reply, guildId))) return
                const player = getPlayer(guildId)

                if (!player || !player.playing) return reply.code(400).send({ message: '目前沒有在播放音樂' })
                if (!player.paused) return reply.code(400).send({ message: '音樂沒有在暫停狀態' })

                await player.resume()
                return reply.send({ ok: true })
            }
        )

        this.fastify.post<MusicParams & { Body: { query?: string } }>(
            '/api/guilds/:guildId/music/search',
            { preHandler: musicLimit() },
            async (request, reply) => {
                const { guildId } = request.params
                if (!(await authorizeGuildMember(this.client, request, reply, guildId))) return
                const query = request.body?.query?.trim()
                if (!query || query.length > 500) {
                    return reply.code(400).send({ message: 'query 必須是 1 到 500 字元的字串' })
                }
                if (!this.client.moonlink) {
                    return reply.code(503).send({ message: '音樂服務尚未初始化' })
                }
                try {
                    const result = await this.client.moonlink.search({ query })
                    return reply.send({
                        tracks: result.tracks.slice(0, 10).map((track: any) => ({
                            title: track.title,
                            url: track.uri,
                            duration: track.duration,
                            thumbnail: track.thumbnail,
                            author: track.author,
                            source: track.source
                        }))
                    })
                } catch (error) {
                    this.fastify.log.error(error, '搜尋歌曲失敗')
                    return reply.code(502).send({ message: '搜尋歌曲失敗，請稍後再試' })
                }
            }
        )

        this.fastify.post<MusicParams & { Body: { url?: string } }>(
            '/api/guilds/:guildId/music/add',
            { preHandler: musicLimit() },
            async (request, reply) => {
                const { guildId } = request.params
                if (!(await authorizeDJ(this.client, request, reply, guildId))) return
                const url = request.body?.url?.trim()
                if (!url || url.length > 2000) {
                    return reply.code(400).send({ message: 'url 必須是 1 到 2000 字元的字串' })
                }
                const player = getPlayer(guildId)
                if (!player || !this.client.moonlink) {
                    return reply.code(409).send({ message: '請先在 Discord 中啟動音樂播放器並加入語音頻道' })
                }
                try {
                    const result = await this.client.moonlink.search({ query: url })
                    const track = result.tracks[0]
                    if (!track) return reply.code(404).send({ message: '找不到歌曲' })
                    player.queue.add(track)
                    if (!player.playing && !player.paused) await player.play()
                    return reply.send({
                        ok: true,
                        track: {
                            title: track.title,
                            url: track.uri,
                            duration: track.duration,
                            thumbnail: track.thumbnail,
                            author: track.author
                        },
                        queueLength: player.queue.tracks.length
                    })
                } catch (error) {
                    this.fastify.log.error(error, '加入歌曲失敗')
                    return reply.code(502).send({ message: '加入歌曲失敗，請稍後再試' })
                }
            }
        )

        this.fastify.get<MusicLyricsParams>(
            '/api/guilds/:guildId/music/lyrics',
            { preHandler: musicLimit() },
            async (request, reply) => {
                const { guildId } = request.params
                if (!(await authorizeGuildMember(this.client, request, reply, guildId))) return
                const player = getPlayer(guildId)
                const track = player?.current
                if (!track) return reply.code(404).send({ message: '目前沒有正在播放的歌曲' })

                const requestedIndex = request.query.index === undefined ? 0 : Number(request.query.index)
                if (!Number.isInteger(requestedIndex) || requestedIndex < 0 || requestedIndex >= 6) {
                    return reply.code(400).send({ message: '歌詞搜尋結果索引無效' })
                }

                try {
                    // Keep one stable Genius result set per currently playing track.
                    // Re-running search for every selection can reorder results and make
                    // the same index point to a different song.
                    const cacheKey = `${guildId}:${track.uri}`
                    const now = Date.now()
                    let cached = this.lyricsSearchCache.get(cacheKey)
                    if (!cached || cached.expiresAt <= now) {
                        const genius = new Genius.Client()
                        const searchQuery = [track.title, track.author].filter(Boolean).join(' ')
                        const songs = (await genius.songs.search(searchQuery)).slice(0, 6)
                        cached = { expiresAt: now + 10 * 60 * 1000, songs }
                        this.lyricsSearchCache.set(cacheKey, cached)

                        // Bound memory usage for long-running bot processes.
                        if (this.lyricsSearchCache.size > 100) {
                            const oldestKey = this.lyricsSearchCache.keys().next().value
                            if (oldestKey) this.lyricsSearchCache.delete(oldestKey)
                        }
                    }

                    const songs = cached.songs
                    const candidates = songs.map((song, index) => ({
                        index,
                        title: song.title,
                        artist: song.artist?.name ?? track.author,
                        url: song.url
                    }))
                    // Prefer the Genius URL as the stable candidate identity.
                    // Search result positions can change, but a candidate URL identifies
                    // the exact song selected by the user.
                    const requestedUrl = request.query.url
                    const selectedIndex = requestedUrl
                        ? songs.findIndex(candidate => candidate.url === requestedUrl)
                        : requestedIndex
                    const song = selectedIndex >= 0 ? songs[selectedIndex] : undefined
                    if (!song) return reply.code(404).send({ message: '找不到這首歌的歌詞' })

                    const lyrics = cleanGeniusLyrics(await song.lyrics())
                    if (!lyrics?.trim()) return reply.code(404).send({ message: '找不到這首歌的歌詞' })

                    return reply.send({
                        title: song.title,
                        author: song.artist?.name || track.author,
                        url: song.url,
                        lyrics: lyrics.slice(0, 20000),
                        truncated: lyrics.length > 20000,
                        source: 'Genius',
                        candidates,
                        selectedIndex
                    })
                } catch (error) {
                    this.fastify.log.error(error, '取得歌詞失敗')
                    return reply.code(502).send({ message: '取得歌詞失敗，請稍後再試' })
                }
            }
        )

        this.fastify.post<MusicParams>(
            '/api/guilds/:guildId/music/previous',
            { preHandler: musicLimit() },
            async (request, reply) => {
                const { guildId } = request.params
                if (!(await authorizeDJ(this.client, request, reply, guildId))) return
                const player = getPlayer(guildId)
                if (!player?.current) return reply.code(400).send({ message: '目前沒有正在播放的音樂' })
                if (player.previous.length === 0) return reply.code(409).send({ message: '沒有上一首歌曲' })
                await player.back()
                return reply.send({ ok: true })
            }
        )

        this.fastify.put<MusicParams & { Body: { volume?: number } }>(
            '/api/guilds/:guildId/music/volume',
            { preHandler: musicLimit() },
            async (request, reply) => {
                const { guildId } = request.params
                if (!(await authorizeDJ(this.client, request, reply, guildId))) return
                const player = getPlayer(guildId)
                const volume = request.body?.volume
                if (!player) return reply.code(400).send({ message: '目前沒有音樂播放器' })
                if (typeof volume !== 'number' || !Number.isFinite(volume) || volume < 0 || volume > 100) {
                    return reply.code(400).send({ message: 'volume 必須是 0 到 100 之間的數字' })
                }
                await player.setVolume(volume)
                return reply.send({ ok: true, volume: player.volume })
            }
        )

        this.fastify.put<MusicParams & { Body: { mode?: string } }>(
            '/api/guilds/:guildId/music/loop',
            { preHandler: musicLimit() },
            async (request, reply) => {
                const { guildId } = request.params
                if (!(await authorizeDJ(this.client, request, reply, guildId))) return
                const player = getPlayer(guildId)
                const mode = request.body?.mode
                if (!player) return reply.code(400).send({ message: '目前沒有音樂播放器' })
                if (mode !== 'off' && mode !== 'track' && mode !== 'queue') {
                    return reply.code(400).send({ message: 'mode 必須是 off、track 或 queue' })
                }
                await player.setLoop(mode)
                return reply.send({ ok: true, repeatMode: player.loop })
            }
        )

        this.fastify.post<MusicParams>(
            '/api/guilds/:guildId/music/shuffle',
            { preHandler: musicLimit() },
            async (request, reply) => {
                const { guildId } = request.params
                if (!(await authorizeDJ(this.client, request, reply, guildId))) return
                const player = getPlayer(guildId)
                if (!player?.current) return reply.code(400).send({ message: '目前沒有正在播放的音樂' })
                if (player.queue.tracks.length < 2) {
                    return reply.code(409).send({ message: '佇列至少需要兩首歌曲才能隨機排序' })
                }
                player.shuffle()
                return reply.send({ ok: true, queueLength: player.queue.tracks.length })
            }
        )

        this.fastify.put<MusicParams & { Body: { enabled?: boolean } }>(
            '/api/guilds/:guildId/music/autoplay',
            { preHandler: musicLimit() },
            async (request, reply) => {
                const { guildId } = request.params
                if (!(await authorizeDJ(this.client, request, reply, guildId))) return
                const player = getPlayer(guildId)
                const enabled = request.body?.enabled
                if (!player) return reply.code(400).send({ message: '目前沒有音樂播放器' })
                if (typeof enabled !== 'boolean') {
                    return reply.code(400).send({ message: 'enabled 必須是布林值' })
                }
                player.setAutoPlay(enabled)
                return reply.send({ ok: true, autoPlay: player.autoPlay })
            }
        )

        this.fastify.post<MusicParams & { Body: { action?: string; value?: unknown } }>(
            '/api/guilds/:guildId/music/control',
            { preHandler: musicLimit() },
            async (request, reply) => {
                const { guildId } = request.params
                if (!(await authorizeDJ(this.client, request, reply, guildId))) return
                const player = getPlayer(guildId)
                const { action, value } = request.body ?? {}

                if (!player) return reply.code(400).send({ message: '目前沒有音樂播放器' })

                try {
                    switch (action) {
                        case 'pause':
                            if (!player.playing || player.paused) {
                                return reply.code(409).send({ message: '目前無法暫停音樂' })
                            }
                            await player.pause()
                            break
                        case 'resume':
                            if (!player.playing || !player.paused) {
                                return reply.code(409).send({ message: '目前無法恢復播放' })
                            }
                            await player.resume()
                            break
                        case 'skip':
                            if (!player.playing) return reply.code(409).send({ message: '目前沒有正在播放的音樂' })
                            await player.skip()
                            break
                        case 'previous':
                            if (!player.current || player.previous.length === 0) {
                                return reply.code(409).send({ message: '沒有上一首歌曲' })
                            }
                            await player.back()
                            break
                        case 'stop':
                            player.destroy()
                            return reply.send({ ok: true, stopped: true })
                        case 'volume':
                            if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100) {
                                return reply.code(400).send({ message: 'value 必須是 0 到 100 之間的音量' })
                            }
                            await player.setVolume(value)
                            break
                        case 'loop':
                            if (value !== 'off' && value !== 'track' && value !== 'queue') {
                                return reply.code(400).send({ message: 'value 必須是 off、track 或 queue' })
                            }
                            await player.setLoop(value)
                            break
                        case 'autoplay':
                            if (typeof value !== 'boolean') {
                                return reply.code(400).send({ message: 'value 必須是布林值' })
                            }
                            player.setAutoPlay(value)
                            break
                        case 'shuffle':
                            if (player.queue.tracks.length < 2) {
                                return reply.code(409).send({ message: '佇列至少需要兩首歌曲才能隨機排序' })
                            }
                            player.shuffle()
                            break
                        default:
                            return reply.code(400).send({ message: '不支援的音樂控制操作' })
                    }

                    return reply.send({
                        ok: true,
                        playing: player.playing,
                        paused: player.paused,
                        position: player.position,
                        volume: player.volume,
                        repeatMode: player.loop,
                        autoPlay: player.autoPlay
                    })
                } catch (error) {
                    this.fastify.log.error(error, '音樂控制操作失敗')
                    return reply.code(500).send({ message: '音樂控制操作失敗' })
                }
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
