import type { PaperClient } from '@/classes/PaperClient.js'
import { aggregateWeeklyStats } from '@/jobs/weeklyAggregation.js'
import { Logger } from '@/libs/utils/logger.js'
import fastifyCors from '@fastify/cors'
import Fastify from 'fastify'

export class ApiServer {
    private fastify: any
    private client: PaperClient

    constructor(client: PaperClient) {
        this.client = client
        this.fastify = Fastify({
            logger: true
        })
        this.setupCors()
        this.setupRoutes()
    }

    private setupCors() {
        this.fastify.register(fastifyCors, {
            origin: ['https://paper-dashboard.vercel.app', 'http://localhost:3000'],
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true
        })
    }

    private setupRoutes() {
        this.fastify.get('/api/bot-status', async (request: any, reply: any) => {
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

        this.fastify.get('/api/guilds', async (request: any, reply: any) => {
            if (!this.client.isReady()) {
                return reply.code(503).send({ message: 'Bot is not ready yet.' })
            }

            try {
                const { userId } = request.query as { userId?: string }

                if (!userId) {
                    return reply.code(400).send({ message: 'userId parameter is required' })
                }

                const userGuilds: Array<{
                    id: string
                    name: string
                    icon: string | null
                    memberCount: number
                    ownerId: string
                }> = []

                for (const guild of this.client.guilds.cache.values()) {
                    try {
                        const member = await guild.members.fetch(userId)

                        const hasManagePermissions =
                            member.permissions.has('ManageGuild') ||
                            member.permissions.has('ManageRoles') ||
                            member.permissions.has('ManageChannels') ||
                            member.permissions.has('ManageMessages') ||
                            member.permissions.has('Administrator')

                        if (hasManagePermissions) {
                            userGuilds.push({
                                id: guild.id,
                                name: guild.name,
                                icon: guild.iconURL(),
                                memberCount: guild.memberCount,
                                ownerId: guild.ownerId
                            })
                        }
                    } catch (memberError) {
                        this.fastify.log.debug(
                            `找不到用戶ID: ${userId}，於伺服器ID: ${guild.id}: ${memberError}`
                        )
                        continue
                    }
                }

                reply.send(userGuilds)
            } catch (error) {
                this.fastify.log.error('抓取伺服器資料時發生錯誤：', error)
                reply.code(500).send({
                    message: '抓取伺服器資料失敗',
                    error: error instanceof Error ? error.message : String(error)
                })
            }
        })

        // 獲取特定伺服器詳細資訊
        this.fastify.get('/api/guilds/:guildId', async (request: any, reply: any) => {
            const { guildId } = request.params as { guildId: string }

            if (!this.client.isReady()) {
                return reply.code(503).send({ message: '機器人尚未上線' })
            }

            try {
                const guild = this.client.guilds.cache.get(guildId)

                if (!guild) {
                    return reply.code(404).send({ message: '在快取中找不到伺服器!' })
                }

                const guildInfo = {
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
                }

                reply.send(guildInfo)
            } catch (error) {
                this.fastify.log.error(`抓取伺服器: ${guildId} 資料時發生錯誤:`, error)
                reply.code(500).send({
                    message: '無法抓取伺服器資料',
                    error: error instanceof Error ? error.message : String(error)
                })
            }
        })

        this.fastify.get('/aggregateWeeklyStats', async (request, reply) => {
            try {
                await aggregateWeeklyStats()
                reply.code(200).send({ ok: true })
            } catch (err) {
                Logger.error(err as Error)
                reply.code(500).send({ ok: false, error: err })
            }
        })

        this.fastify.get('/health', async (request, reply) => {
            await reply.code(200)
            return { status: 'OK', timestamp: new Date().toISOString() }
        })
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
