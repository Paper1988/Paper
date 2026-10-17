import { timingSafeEqual } from 'node:crypto'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { aggregateWeeklyStats } from '@/jobs/weeklyAggregation.js'
import { Logger } from '@/libs/utils/logger.js'
import fastifyCors from '@fastify/cors'
import Fastify, { type FastifyInstance, type FastifyRequest } from 'fastify'

export class ApiServer {
    private fastify: FastifyInstance
    private client: PaperClient

    constructor(client: PaperClient) {
        this.client = client
        this.fastify = Fastify({ logger: true })
        this.setupCors()
        this.setupAuthentication()
        this.setupRoutes()
    }

    private setupCors() {
        this.fastify.register(fastifyCors, {
            origin: [process.env.GO_API_URL ?? 'http://localhost:8080'],
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true
        })
    }


    /**
     * Restrict internal API routes to trusted server-to-server callers.
     *
     * Configure PAPER_API_SECRET on this service and send the same value from
     * the Go API in the Authorization: Bearer <secret> header.
     * Health and public bot-status endpoints intentionally remain public.
     */
    private setupAuthentication() {
        this.fastify.addHook('onRequest', async (request, reply) => {
            if (request.method === 'OPTIONS') return

            const publicPaths = new Set(['/health', '/api/bot-status'])
            if (publicPaths.has(request.url.split('?')[0] ?? '')) return

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

            if (
                supplied.length !== expected.length ||
                !timingSafeEqual(supplied, expected)
            ) {
                return reply.code(401).send({ message: 'Unauthorized' })
            }
        })
    }

    private setupRoutes() {
        this.fastify.get('/health', async (_request, reply) => {
            reply.code(200).send({ status: 'OK', timestamp: new Date().toISOString() })
        })

        this.fastify.get('/api/bot-status', async (_request, reply) => {
            if (this.client.isReady()) {
                reply.send({
                    status: 'online',
                    username: this.client.user?.tag,
                    guildCount: this.client.guilds.cache.size
                })
            } else {
                reply.code(503).send({ status: 'offline', message: '機器人已離線' })
            }
        })

        this.fastify.get(
            '/api/guilds',
            async (request: FastifyRequest<{ Querystring: { userId?: string } }>, reply) => {
                if (!this.client.isReady()) {
                    return reply.code(503).send({ message: 'Bot is not ready yet.' })
                }

                const userId =
                    (request.headers['x-discord-id'] as string | undefined) ?? request.query.userId

                if (!userId) {
                    return reply.code(400).send({ message: 'userId is required' })
                }

                try {
                    const userGuilds = this.client.guilds.cache
                        .filter((guild) => {
                            const member = guild.members.cache.get(userId)
                            if (!member) return false
                            return member.permissions.has([
                                'ManageGuild',
                                'ManageRoles',
                                'ManageChannels',
                                'ManageMessages',
                                'Administrator'
                            ])
                        })
                        .map((guild) => ({
                            id: guild.id,
                            name: guild.name,
                            icon: guild.iconURL(),
                            memberCount: guild.memberCount,
                            ownerId: guild.ownerId
                        }))

                    return userGuilds
                } catch (error) {
                    this.fastify.log.error(error)
                    reply.code(500).send({ message: '抓取伺服器資料失敗' })
                }
            }
        )

        this.fastify.get(
            '/api/guilds/:guildId',
            async (request: FastifyRequest<{ Params: { guildId: string } }>, reply) => {
                if (!this.client.isReady()) {
                    return reply.code(503).send({ message: '機器人尚未上線' })
                }

                const { guildId } = request.params
                const guild = this.client.guilds.cache.get(guildId)

                if (!guild) {
                    return reply.code(404).send({ message: '在快取中找不到伺服器' })
                }

                reply.send({
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

        this.fastify.get('/aggregateWeeklyStats', async (_request, reply) => {
            try {
                await aggregateWeeklyStats()
                reply.code(200).send({ ok: true })
            } catch (err) {
                Logger.error(err as Error)
                reply.code(500).send({ ok: false, error: err })
            }
        })

        this.setupGiveawayRoutes()
        this.setupMusicRoutes()
    }

    private setupGiveawayRoutes() {
        type GiveawayParams = { Params: { guildId: string; messageId: string } }

        this.fastify.post<GiveawayParams>(
            '/api/guilds/:guildId/giveaways/:messageId/end',
            async (request, reply) => {
                const { guildId, messageId } = request.params

                const guild = this.client.guilds.cache.get(guildId)
                if (!guild) {
                    return reply.code(404).send({ message: '找不到伺服器' })
                }

                try {
                    const giveawayManager = (this.client as any).giveawayManager
                    if (!giveawayManager) {
                        return reply.code(501).send({ message: 'Giveaway manager 未初始化' })
                    }

                    const giveaway = giveawayManager.giveaways.get(messageId)

                    if (!giveaway || giveaway.guildId !== guildId) {
                        return reply.code(404).send({ message: '找不到抽獎活動' })
                    }

                    if (giveaway.ended) {
                        return reply.code(400).send({ message: '抽獎已結束' })
                    }

                    await giveawayManager.end(messageId)
                    reply.send({ ok: true, message: '抽獎已強制結束' })
                } catch (error) {
                    this.fastify.log.error(error)
                    reply.code(500).send({ message: '結束抽獎失敗' })
                }
            }
        )

        this.fastify.post<GiveawayParams>(
            '/api/guilds/:guildId/giveaways/:messageId/reroll',
            async (request, reply) => {
                const { guildId, messageId } = request.params

                const guild = this.client.guilds.cache.get(guildId)
                if (!guild) {
                    return reply.code(404).send({ message: '找不到伺服器' })
                }

                try {
                    const giveawayManager = (this.client as any).giveawayManager
                    if (!giveawayManager) {
                        return reply.code(501).send({ message: 'Giveaway manager 未初始化' })
                    }

                    const winners = await giveawayManager.reroll(messageId)
                    reply.send({ ok: true, winners })
                } catch (error) {
                    this.fastify.log.error(error)
                    reply.code(500).send({ message: '重抽失敗' })
                }
            }
        )
    }

    private setupMusicRoutes() {
        type MusicParams = { Params: { guildId: string } }

        const getPlayer = (guildId: string) => {
            const player = this.client.moonlink!.players.get(guildId)
            if (!player) return null
            return player
        }

        this.fastify.get<MusicParams>(
            '/api/guilds/:guildId/music/queue',
            async (request, reply) => {
                const { guildId } = request.params
                const player = getPlayer(guildId)

                if (!player || !player.playing) {
                    return reply.send({ playing: false, tracks: [] })
                }

                reply.send({
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
            async (request, reply) => {
                const { guildId } = request.params
                const player = getPlayer(guildId)

                if (!player || !player.playing) {
                    return reply.code(400).send({ message: '目前沒有在播放音樂' })
                }

                await player.skip()
                reply.send({ ok: true })
            }
        )

        this.fastify.post<MusicParams>(
            '/api/guilds/:guildId/music/pause',
            async (request, reply) => {
                const { guildId } = request.params
                const player = getPlayer(guildId)

                if (!player || !player.playing) {
                    return reply.code(400).send({ message: '目前沒有在播放音樂' })
                }

                if (player.paused) {
                    return reply.code(400).send({ message: '音樂已經是暫停狀態' })
                }

                await player.pause()
                reply.send({ ok: true })
            }
        )

        this.fastify.post<MusicParams>(
            '/api/guilds/:guildId/music/resume',
            async (request, reply) => {
                const { guildId } = request.params
                const player = getPlayer(guildId)

                if (!player || !player.playing) {
                    return reply.code(400).send({ message: '目前沒有在播放音樂' })
                }

                if (!player.paused) {
                    return reply.code(400).send({ message: '音樂沒有在暫停狀態' })
                }

                await player.resume()
                reply.send({ ok: true })
            }
        )

        this.fastify.delete<MusicParams>(
            '/api/guilds/:guildId/music/queue',
            async (request, reply) => {
                const { guildId } = request.params
                const player = getPlayer(guildId)

                if (!player) {
                    return reply.code(400).send({ message: '目前沒有在播放音樂' })
                }

                player.destroy()
                reply.send({ ok: true })
            }
        )
    }

    async start() {
        const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001
        const HOST = '0.0.0.0'

        try {
            await this.fastify.listen({ port: PORT, host: HOST })
            Logger.info(`機器人的API伺服器在： ${HOST}:${PORT}`)
            Logger.info(`環境： ${process.env.NODE_ENV || 'development'}`)
        } catch (err) {
            this.fastify.log.error(err)
            throw err
        }
    }
}
