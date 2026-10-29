import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import MusicDB from '@/Structures/Schemas/MusicDB.js'
import { authorizeDJRoleManager } from '@/Systems/Music/DJRoleService.js'
import type { SubCommandType } from '@/typings/command.js'
import { MessageFlags, type ChatInputCommandInteraction } from 'discord.js'

export default {
    subCommand: 'music.dj.mode',
    async execute(interaction: ChatInputCommandInteraction, _client: PaperClient) {
        const guild = await authorizeDJRoleManager(interaction)
        if (!guild) return

        const enabled = interaction.options.getBoolean('enabled', true)

        try {
            if (enabled) {
                const settings = await MusicDB.findOne({ GuildID: guild.id }).lean()
                if (!settings?.DJRoleID || !guild.roles.cache.has(settings.DJRoleID)) {
                    return interaction.reply({
                        content: '啟用 DJ 模式前，請先使用 /music dj create 建立 DJ 身份組，或使用 /music dj bind 綁定既有身份組。',
                        flags: MessageFlags.Ephemeral
                    })
                }
            }

            await MusicDB.findOneAndUpdate(
                { GuildID: guild.id },
                { $set: { DJModeEnabled: enabled } },
                { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
            )

            return interaction.reply({
                content: enabled
                    ? '已啟用 DJ 模式。現在只有具備此伺服器 DJ 身份組的成員可以控制音樂。'
                    : '已停用 DJ 模式。現在所有伺服器成員都可以使用音樂控制功能；原本綁定的 DJ 身份組會保留。',
                flags: MessageFlags.Ephemeral
            })
        } catch (error) {
            console.error('[Music DJ Mode] Failed to update DJ mode:', error)
            return interaction.reply({
                content: '更新 DJ 模式失敗，請稍後再試。',
                flags: MessageFlags.Ephemeral
            })
        }
    }
} as SubCommandType
