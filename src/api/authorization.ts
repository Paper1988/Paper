import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import type { FastifyReply, FastifyRequest } from 'fastify'

export async function authorizeGuildManager(
        client: PaperClient,
        request: FastifyRequest,
        reply: FastifyReply,
        guildId: string
    ): Promise<boolean> {
        const userId = request.headers['x-discord-id']
        if (typeof userId !== 'string' || !/^\d{17,20}$/.test(userId)) {
            reply.code(401).send({ message: '使用者身分無效或缺失' })
            return false
        }

        if (!client.isReady()) {
            reply.code(503).send({ message: '機器人尚未上線' })
            return false
        }

        const guild = client.guilds.cache.get(guildId)
        if (!guild) {
            reply.code(404).send({ message: '找不到伺服器' })
            return false
        }

        if (guild.ownerId === userId) return true

        try {
            const member = await guild.members.fetch(userId)
            if (member.permissions.has('Administrator') || member.permissions.has('ManageGuild')) {
                return true
            }
        } catch {
            // The user is not a member of this guild, or Discord could not resolve the member.
        }

        reply.code(403).send({ message: '沒有管理此伺服器的權限' })
        return false
}
