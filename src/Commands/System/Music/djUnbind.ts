import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import MusicDB from '@/Structures/Schemas/MusicDB.js'
import { unbindDJRole, authorizeDJRoleManager } from '@/Systems/Music/DJRoleService.js'
import type { SubCommandType } from '@/typings/command.js'
import { MessageFlags, type ChatInputCommandInteraction } from 'discord.js'

export default {
    subCommand: 'music.dj.unbind',
    async execute(interaction: ChatInputCommandInteraction, _client: PaperClient) {
        const guild = await authorizeDJRoleManager(interaction)
        if (!guild) return

        try {
            const settings = await MusicDB.findOne({ GuildID: guild.id })
            if (!settings?.DJRoleID) {
                return interaction.reply({
                    content: '此伺服器目前沒有綁定 DJ 身份組。',
                    flags: MessageFlags.Ephemeral
                })
            }

            await unbindDJRole(guild.id)
            return interaction.reply({
                content: '已解除 DJ 身份組綁定。重新綁定前，任何成員都無法操作音樂控制面板或 Dashboard 播放控制。',
                flags: MessageFlags.Ephemeral
            })
        } catch (error) {
            console.error('[Music DJ Unbind] Failed to unbind role:', error)
            return interaction.reply({
                content: '解除 DJ 身份組綁定失敗，請稍後再試。',
                flags: MessageFlags.Ephemeral
            })
        }
    }
} as SubCommandType
