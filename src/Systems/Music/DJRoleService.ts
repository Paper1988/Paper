import MusicDB from '@/Structures/Schemas/MusicDB.js'
import { Guild, ChatInputCommandInteraction, MessageFlags, PermissionFlagsBits } from 'discord.js'

/** Only the server owner or a member with Manage Roles can configure DJ access. */
export async function authorizeDJRoleManager(interaction: ChatInputCommandInteraction): Promise<Guild | null> {
    const guild = interaction.guild
    if (!guild) {
        await interaction.reply({
            content: '此指令只能在 Discord 伺服器中使用。',
            flags: MessageFlags.Ephemeral
        })
        return null
    }

    const canManageRoles =
        guild.ownerId === interaction.user.id ||
        interaction.memberPermissions?.has(PermissionFlagsBits.ManageRoles) === true

    if (!canManageRoles) {
        await interaction.reply({
            content: '你需要「管理身分組」權限才能設定 DJ 身份組。',
            flags: MessageFlags.Ephemeral
        })
        return null
    }

    return guild
}

export async function bindDJRole(guildId: string, roleId: string): Promise<void> {
    await MusicDB.findOneAndUpdate(
        { GuildID: guildId },
        { $set: { DJRoleID: roleId } },
        { upsert: true, returnDocument: 'after' }
    )
}

export async function unbindDJRole(guildId: string): Promise<void> {
    await MusicDB.findOneAndUpdate(
        { GuildID: guildId },
        { $unset: { DJRoleID: 1 } },
        { upsert: true, returnDocument: 'after' }
    )
}
