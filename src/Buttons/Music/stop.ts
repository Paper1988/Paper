import { clearPlayer, deleteMessageAfter, updateMusicPlayerStatus } from '@/Systems/Music'
import type { PaperClient } from '@/classes/PaperClient'
import emojis from '@/libs/emoji/emoji'
import type { ButtonType } from '@/typings/component'
import type { ButtonInteraction, GuildMember } from 'discord.js'

export default {
    id: 'stop',
    async execute(interaction: ButtonInteraction, client: PaperClient) {
        await interaction.deferReply()
        const member = interaction.member! as GuildMember
        const VoiceChannel = member.voice.channel

        if (!VoiceChannel)
            return await interaction
                .editReply({
                    content: `${emojis.warning} | 你必須待在語音頻道裡面才能使用音樂按鈕!`
                })
                .then((msg) => deleteMessageAfter(msg, 10 * 1000))

        const currentVoiceChannel = interaction.guild?.members.me?.voice.channelId
        if (currentVoiceChannel && VoiceChannel.id !== currentVoiceChannel)
            return await interaction.editReply({
                content: `${emojis.warning} | 我已經在語音頻道 - <#${currentVoiceChannel}> 裡播放音樂了`
            })

        const queue = client.distube.getQueue(VoiceChannel)
        if (!queue)
            return await interaction
                .editReply({
                    content: `${emojis.outage} | 找不到歌曲或該歌曲已經播放完畢!`
                })
                .then((msg) => deleteMessageAfter(msg, 10 * 1000))

        await updateMusicPlayerStatus(queue, true)
        clearPlayer(queue)
        await queue.stop()
        queue.voice.leave()
        await interaction
            .editReply({
                content: '<:stop:1265562218498363422> | 成功停止音樂並退出語音頻道'
            })
            .then((msg) => deleteMessageAfter(msg, 10 * 1000))
    }
} satisfies ButtonType
