import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GuildMember } from 'discord.js'

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


/** Resolve a Discord member who belongs to the requested guild. */
export async function getGuildMember(client: PaperClient, request: FastifyRequest, reply: FastifyReply, guildId: string): Promise<GuildMember | null> {
    const userId = request.headers['x-discord-id']
    if (typeof userId !== 'string' || !/^\d{17,20}$/.test(userId)) {
        reply.code(401).send({ message: '使用者身分無效或缺失' })
        return null
    }
    if (!client.isReady()) {
        reply.code(503).send({ message: '機器人尚未上線' })
        return null
    }
    const guild = client.guilds.cache.get(guildId)
    if (!guild) {
        reply.code(404).send({ message: '找不到伺服器' })
        return null
    }
    try {
        return guild.members.cache.get(userId) ?? await guild.members.fetch(userId)
    } catch {
        reply.code(403).send({ message: '你必須是此 Discord 伺服器的成員才能使用 Dashboard' })
        return null
    }
}

/** Read-only guild access is available to every member of the guild. */
export async function authorizeGuildMember(client: PaperClient, request: FastifyRequest, reply: FastifyReply, guildId: string): Promise<boolean> {
    return (await getGuildMember(client, request, reply, guildId)) !== null
}

/** DJ identity is a Discord role named "DJ" (case-insensitive). */
export function isDJMember(member: GuildMember): boolean {
    return member.roles.cache.some(role => role.name.trim().toLowerCase() === 'dj')
}

export async function hasGuildDJRole(client: PaperClient, guildId: string, userId: string): Promise<boolean> {
    const guild = client.guilds.cache.get(guildId)
    if (!guild) return false
    try {
        const member = guild.members.cache.get(userId) ?? await guild.members.fetch(userId)
        return isDJMember(member)
    } catch {
        return false
    }
}

/** Mutating music actions require the guild's DJ role, including for administrators. */
export async function authorizeDJ(client: PaperClient, request: FastifyRequest, reply: FastifyReply, guildId: string): Promise<boolean> {
    const member = await getGuildMember(client, request, reply, guildId)
    if (!member) return false
    if (isDJMember(member)) return true
    reply.code(403).send({ message: '需要此伺服器的 DJ 身份才能控制音樂' })
    return false
}
