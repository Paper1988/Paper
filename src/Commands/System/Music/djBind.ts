import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { bindDJRole, authorizeDJRoleManager } from '@/Systems/Music/DJRoleService.js'
import type { SubCommandType } from '@/typings/command.js'
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js'

export default {
    subCommand: 'music.dj.bind',
    async execute(interaction: ChatInputCommandInteraction, _client: PaperClient) {
        const guild = await authorizeDJRoleManager(interaction)
        if (!guild) return

        const role = interaction.options.getRole('role', true)
        if (role.id === guild.id) {
            return interaction.reply({
                content: '不能將 @everyone 綁定為 DJ 身份組，否則所有成員都能控制音樂。',
                flags: MessageFlags.Ephemeral
            })
        }

        try {
            await bindDJRole(guild.id, role.id)
            return interaction.reply({
                content: `已將 ${role} 綁定為此伺服器的 DJ 身份組。資料庫只會儲存身份組 ID，因此更改名稱不會影響權限。`,
                flags: MessageFlags.Ephemeral
            })
        } catch (error) {
            console.error('[Music DJ Bind] Failed to bind role:', error)
            return interaction.reply({
                content: '綁定 DJ 身份組失敗，請稍後再試。',
                flags: MessageFlags.Ephemeral
            })
        }
    }
} as SubCommandType
