import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import MusicDB from '@/Structures/Schemas/MusicDB.js'
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

/** Check whether a guild member has the role ID configured in the music database. */
export async function hasGuildDJRole(client: PaperClient, guildId: string, userId: string): Promise<boolean> {
    const guild = client.guilds.cache.get(guildId)
    if (!guild) return false

    try {
        const [member, settings] = await Promise.all([
            guild.members.cache.get(userId) ?? guild.members.fetch(userId),
            MusicDB.findOne({ GuildID: guildId })
        ])
        if (settings?.DJModeEnabled === false) return true
        return Boolean(settings?.DJRoleID && member.roles.cache.has(settings.DJRoleID))
    } catch {
        return false
    }
}

/** Mutating music actions require the configured DJ role, including for administrators. */
export async function authorizeDJ(client: PaperClient, request: FastifyRequest, reply: FastifyReply, guildId: string): Promise<boolean> {
    const member = await getGuildMember(client, request, reply, guildId)
    if (!member) return false

    const settings = await MusicDB.findOne({ GuildID: guildId }).catch(() => null)
    if (settings?.DJModeEnabled === false) return true

    const roleId = settings?.DJRoleID

    if (!roleId) {
        reply.code(403).send({ message: '此伺服器尚未設定 DJ 身份組，請管理員使用 /music dj create 或 /music dj bind 設定' })
        return false
    }

    if (member.roles.cache.has(roleId)) return true

    reply.code(403).send({ message: '需要具備此伺服器設定的 DJ 身份組才能控制音樂' })
    return false
}
