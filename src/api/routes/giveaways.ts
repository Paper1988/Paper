import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import type { FastifyInstance } from 'fastify'
import { authorizeGuildManager } from '../authorization.js'

export function registerGiveawayRoutes(fastify: FastifyInstance, client: PaperClient) {
        type GiveawayParams = { Params: { guildId: string; messageId: string } }

        fastify.post<GiveawayParams>(
            '/api/guilds/:guildId/giveaways/:messageId/end',
            async (request, reply) => {
                const { guildId, messageId } = request.params
                if (!(await authorizeGuildManager(client, request, reply, guildId))) return

                const guild = client.guilds.cache.get(guildId)
                if (!guild) {
                    return reply.code(404).send({ message: '找不到伺服器' })
                }

                try {
                    const giveawayManager = (client as any).giveawaysManager
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
                    fastify.log.error(error)
                    reply.code(500).send({ message: '結束抽獎失敗' })
                }
            }
        )

        fastify.post<GiveawayParams>(
            '/api/guilds/:guildId/giveaways/:messageId/reroll',
            async (request, reply) => {
                const { guildId, messageId } = request.params
                if (!(await authorizeGuildManager(client, request, reply, guildId))) return

                const guild = client.guilds.cache.get(guildId)
                if (!guild) {
                    return reply.code(404).send({ message: '找不到伺服器' })
                }

                try {
                    const giveawayManager = (client as any).giveawaysManager
                    if (!giveawayManager) {
                        return reply.code(501).send({ message: 'Giveaway manager 未初始化' })
                    }

                    const giveaway = giveawayManager.giveaways.get(messageId)
                    if (!giveaway || giveaway.guildId !== guildId) {
                        return reply.code(404).send({ message: '找不到抽獎活動' })
                    }
                    const winners = await giveawayManager.reroll(messageId)
                    if (!winners) return reply.code(404).send({ message: '抽獎尚未結束或不存在' })
                    reply.send({ ok: true, winners })
                } catch (error) {
                    fastify.log.error(error)
                    reply.code(500).send({ message: '重抽失敗' })
                }
            }
        )
}
