import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { aggregateWeeklyStats } from '@/jobs/weeklyAggregation.js'
import BotStatusHistory from '@/Structures/Schemas/BotStatusHistory.js'
import GuildConfig from '@/Structures/Schemas/GuildConfig.js'
import { Logger } from '@/libs/utils/logger.js'
import type { FastifyInstance, FastifyRequest } from 'fastify'
import { authorizeGuildManager } from '../authorization.js'

export function registerCoreRoutes(fastify: FastifyInstance, client: PaperClient) {
    fastify.get('/health', async (_request, reply) => {
        reply.code(200).send({ status: 'OK', timestamp: new Date().toISOString() })
    })

    fastify.get('/api/bot-status', async (_request, reply) => {
        if (client.isReady()) {
            reply.send({
                status: 'online',
                username: client.user?.tag,
                guildCount: client.guilds.cache.size
            })
        } else {
            reply.code(503).send({ status: 'offline', message: '機器人已離線' })
        }
    })

    fastify.get(
        '/api/bot-status/history',
        async (
            request: FastifyRequest<{ Querystring: { hours?: string } }>,
            reply
        ) => {
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
                fastify.log.error(error, '無法讀取機器人狀態歷史')
                return reply.code(500).send({ message: '無法讀取機器人狀態歷史' })
            }
        }
    )

    fastify.get(
        '/api/guilds',
        async (request: FastifyRequest<{ Querystring: { userId?: string } }>, reply) => {
            if (!client.isReady()) {
                return reply.code(503).send({ message: 'Bot is not ready yet.' })
            }

            const userId =
                (request.headers['x-discord-id'] as string | undefined) ?? request.query.userId

            if (!userId) {
                return reply.code(400).send({ message: 'userId is required' })
            }

            try {
                const userGuilds = (
                    await Promise.all(
                        client.guilds.cache.map(async (guild) => {
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

                return userGuilds
            } catch (error) {
                fastify.log.error(error)
                return reply.code(500).send({ message: '抓取伺服器資料失敗' })
            }
        }
    )

    fastify.get(
        '/api/guilds/:guildId',
        async (request: FastifyRequest<{ Params: { guildId: string } }>, reply) => {
            if (!client.isReady()) {
                return reply.code(503).send({ message: '機器人尚未上線' })
            }

            const { guildId } = request.params
            if (!(await authorizeGuildManager(client, request, reply, guildId))) return
            const guild = client.guilds.cache.get(guildId)

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

    fastify.get('/aggregateWeeklyStats', async (_request, reply) => {
        try {
            await aggregateWeeklyStats()
            reply.code(200).send({ ok: true })
        } catch (err) {
            Logger.error(err as Error)
            reply.code(500).send({ ok: false, message: '週統計彙整失敗' })
        }
    })

    fastify.get(
        '/api/guilds/:guildId/config',
        async (request: FastifyRequest<{ Params: { guildId: string } }>, reply) => {
            const { guildId } = request.params
            if (!(await authorizeGuildManager(client, request, reply, guildId))) return

            const config = await GuildConfig.findOne({ guildId }).lean()
            return reply.send({
                guildId,
                disabledCommands: config?.disabledCommands ?? [],
                availableCommands: client.getAvailableConfigCommands()
            })
        }
    )

    fastify.put(
        '/api/guilds/:guildId/config',
        async (
            request: FastifyRequest<{
                Params: { guildId: string }
                Body: { disabledCommands?: unknown }
            }>,
            reply
        ) => {
            const { guildId } = request.params
            if (!(await authorizeGuildManager(client, request, reply, guildId))) return

            const disabledCommands = request.body?.disabledCommands
            if (
                !Array.isArray(disabledCommands) ||
                !disabledCommands.every((command): command is string => typeof command === 'string') ||
                new Set(disabledCommands).size !== disabledCommands.length
            ) {
                return reply.code(400).send({ message: 'disabledCommands 必須是無重複字串陣列' })
            }

            const availableCommands = new Set(
                client.getAvailableConfigCommands().map((command) => command.name)
            )
            if (disabledCommands.some((command) => !availableCommands.has(command))) {
                return reply.code(400).send({ message: '包含無法設定的指令' })
            }

            const config = await GuildConfig.findOneAndUpdate(
                { guildId },
                { $set: { disabledCommands } },
                { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
            ).lean()

            return reply.send({
                guildId,
                disabledCommands: config?.disabledCommands ?? [],
                availableCommands: client.getAvailableConfigCommands()
            })
        }
    )
}
