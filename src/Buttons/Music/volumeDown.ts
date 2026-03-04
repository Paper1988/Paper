import MusicDB from '@/Structures/Schemas/MusicDB.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { deleteMessageAfter, updateMusicPlayerStatus } from '@/Systems/Music.js'
import emojis from '@/libs/emoji/emoji.js'
import type { ButtonType } from '@/typings/component.js'
import type { ButtonInteraction, GuildMember } from 'discord.js'
import type { Player } from 'moonlink.js'

export default {
    id: 'volumeDown',
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

        player.setVolume(player.volume - 10)

        await updateMusicPlayerStatus(player, client)

        await MusicDB.findOneAndUpdate(
            { GuildID: player.guildId },
            { volume: player.volume },
            { returnDocument: 'after', upsert: true }
        )
        return await interaction
            .editReply({
                content: `<:speaker_low:1265561976663310386> | 成功設置音量: \`${player.volume}%\``
            })
            .then(deleteMessageAfter)
    }
} satisfies ButtonType
