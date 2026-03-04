import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { deleteMessageAfter, updateMusicPlayerStatus } from '@/Systems/Music.js'
import emojis from '@/libs/emoji/emoji.js'
import type { ButtonType } from '@/typings/component.js'
import type { ButtonInteraction, GuildMember } from 'discord.js'
import type { Player } from 'moonlink.js'

export default {
    id: 'togglePause',
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

        if (!player.paused) {
            player.pause()
            await updateMusicPlayerStatus(player, client)
            return await interaction
                .editReply({
                    content: '<:pause:1265561390358331462> | 成功暫停播放歌曲'
                })
                .then(deleteMessageAfter)
        } else if (player.paused || !player.playing) {
            player.resume()
            await updateMusicPlayerStatus(player, client)
            return await interaction
                .editReply({
                    content: '<:play:1265561505458294826> | 成功恢復播放歌曲'
                })
                .then(deleteMessageAfter)
        }
    }
} satisfies ButtonType
