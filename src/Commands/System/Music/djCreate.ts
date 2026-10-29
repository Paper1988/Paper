import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { bindDJRole, authorizeDJRoleManager } from '@/Systems/Music/DJRoleService.js'
import type { SubCommandType } from '@/typings/command.js'
import { MessageFlags, PermissionFlagsBits, type ChatInputCommandInteraction, type Role } from 'discord.js'

export default {
    subCommand: 'music.dj.create',
    async execute(interaction: ChatInputCommandInteraction, _client: PaperClient) {
        const guild = await authorizeDJRoleManager(interaction)
        if (!guild) return

        const botMember = guild.members.me ?? await guild.members.fetchMe().catch(() => null)
        if (!botMember?.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return interaction.reply({
                content: 'Paper 需要「管理身分組」權限才能建立 DJ 身份組。',
                flags: MessageFlags.Ephemeral
            })
        }

        const roleName = interaction.options.getString('name')?.trim() || 'DJ'
        let createdRole: Role | null = null

        try {
            createdRole = await guild.roles.create({
                name: roleName,
                reason: `${interaction.user.tag} 建立並綁定 Paper DJ 身份組`
            })
            await bindDJRole(guild.id, createdRole.id)
        } catch (error) {
            if (createdRole) {
                await createdRole.delete('DJ role database binding failed').catch(() => undefined)
            }
            console.error('[Music DJ Create] Failed to create or bind role:', error)
            return interaction.reply({
                content: '建立或綁定 DJ 身份組失敗，請確認 Paper 的身分組權限及資料庫連線。',
                flags: MessageFlags.Ephemeral
            })
        }

        return interaction.reply({
            content: `已建立並綁定 DJ 身份組：${createdRole}。之後即使更改名稱，也不會影響音樂控制權限。`,
            flags: MessageFlags.Ephemeral
        })
    }
} as SubCommandType
