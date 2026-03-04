import MusicDB from '@/Structures/Schemas/MusicDB.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { deleteMessageAfter } from '@/Systems/Music.js'
import emojis from '@/libs/emoji/emoji.js'
import type { ButtonType } from '@/typings/component.js'
import { type ButtonInteraction, type GuildMember } from 'discord.js'
import type { Player } from 'moonlink.js'

export default {
    id: 'autoplay',
    async execute(interaction: ButtonInteraction, client: PaperClient) {
        await interaction.deferReply()
        const guild = interaction.guild!
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

        if (player.autoPlay) player.setAutoPlay(true)
        else player.setAutoPlay(false)

        await MusicDB.findOneAndUpdate(
            { GuildID: guild.id },
            { autoplayMode: player.autoPlay },
            { returnDocument: 'after', upsert: true }
        )

        return await interaction
            .editReply({
                content: `<:update:1265562455828987968> | 成功切換自動播放模式: ${
                    player.autoPlay ? emojis.correct : emojis.xmark
                }`
            })
            .then(deleteMessageAfter)
    }
} satisfies ButtonType
