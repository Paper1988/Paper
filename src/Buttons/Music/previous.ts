import emojis from '@/libs/emoji/emoji.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { deleteMessageAfter } from '@/Systems/Music.js'
import type { ButtonType } from '@/typings/component.js'
import { type ButtonInteraction, type GuildMember } from 'discord.js'
import type { Player } from 'moonlink.js'

export default {
    id: 'previous',
    async execute(interaction: ButtonInteraction, client: PaperClient) {
        await interaction.deferReply()
        const member = interaction.member! as GuildMember
        const VoiceChannel = member.voice.channel

        if (!VoiceChannel) {
            return await interaction
                .editReply({
                    content: `${emojis.warning} | 你必須待在語音頻道裡面才能使用音樂按鈕!`
                })
                .then(deleteMessageAfter)
        }

        const currentPlayer = client.moonlink?.players.get(interaction.guildId!) as Player
        if (currentPlayer?.voiceChannelId && VoiceChannel.id !== currentPlayer.voiceChannelId) {
            return await interaction
                .editReply({
                    content: `${emojis.warning} | 我已經在語音頻道 - <#${currentPlayer.voiceChannelId}> 裡播放音樂了`
                })
                .then(deleteMessageAfter)
        }

        const player: Player = currentPlayer

        if (!player)
            return await interaction
                .editReply({
                    content: `${emojis.warning} | 找不到歌曲或該歌曲已經播放完畢!`
                })
                .then(deleteMessageAfter)

        player.back()
        return await interaction
            .editReply({
                content: `${emojis.backforward} | 成功返回上一首歌曲`
            })
            .then(deleteMessageAfter)
    }
} satisfies ButtonType
