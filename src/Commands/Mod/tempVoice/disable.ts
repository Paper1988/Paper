import emojis from '@/libs/emoji/emoji.js'
import TempVoice from '@/Structures/Schemas/TempVoice.js'
import type { SubCommandType } from '@/typings/command.js'
import { ChannelType, ChatInputCommandInteraction, MessageFlags } from 'discord.js'

export default {
    subCommand: 'temp-voice.disable',
    async execute(interaction: ChatInputCommandInteraction) {
        const { guild } = interaction

        const Data = await TempVoice.findOneAndDelete({ GuildID: guild!.id }).exec().catch(() => null)
        if (!Data) {
            return await interaction.reply({
                content: `${emojis.warning} | 這個伺服器還沒有設定臨時語音!`,
                flags: MessageFlags.Ephemeral
            })
        }

        await guild!.channels.cache.get(Data.LobbyChannel)?.delete('停用臨時語音系統').catch(() => {})

        // 類別裡還有頻道（例如正在使用的臨時頻道）就先保留，避免裡面的頻道變成沒有類別
        const category = Data.CategoryID ? guild!.channels.cache.get(Data.CategoryID) : null
        const categoryKept = category?.type === ChannelType.GuildCategory && category.children.cache.size > 0
        if (category && !categoryKept) await category.delete('停用臨時語音系統').catch(() => {})

        return await interaction.reply({
            content: categoryKept
                ? `${emojis.correct} | 已停用並刪除大廳。類別裡還有頻道，所以先保留類別`
                : `${emojis.correct} | 已停用並刪除大廳和類別`,
            flags: MessageFlags.Ephemeral
        })
    }
} as SubCommandType
