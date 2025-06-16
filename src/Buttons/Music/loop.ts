import MusicDB from '@/Structures/Schemas/MusicDB'
import { deleteMessageAfter, updateMusicPlayerStatus } from '@/Systems/Music'
import type { PaperClient } from '@/classes/PaperClient'
import emojis from '@/libs/emoji/emoji'
import type { ButtonType } from '@/typings/component'
import type { ButtonInteraction, GuildMember } from 'discord.js'

module.exports = {
    id: 'loop',
    async execute(interaction: ButtonInteraction, client: PaperClient) {
        await interaction.deferReply()
        const member = interaction.member! as GuildMember
        const guild = interaction.guild!
        const VoiceChannel = member.voice.channel

        if (!VoiceChannel) {
            return await interaction
                .editReply({
                    content: `${emojis.warning} | 你必須待在語音頻道裡面才能使用音樂按鈕!`
                })
                .then((msg) => deleteMessageAfter(msg, 10 * 1000))
        }
        const currentVoiceChannel = interaction.guild?.members.me?.voice.channelId
        if (currentVoiceChannel && VoiceChannel.id !== currentVoiceChannel) {
            return await interaction.editReply({
                content: `${emojis.warning} | 我已經在語音頻道 - <#${currentVoiceChannel}> 裡播放音樂了`
            })
        }

        const queue = client.distube.getQueue(VoiceChannel)
        if (!queue) {
            return await interaction
                .editReply({
                    content: `${emojis.outage} | 找不到歌曲或該歌曲已經播放完畢!`
                })
                .then((msg) => deleteMessageAfter(msg, 10 * 1000))
        }

        let Mode = client.distube.setRepeatMode(queue)

        await updateMusicPlayerStatus(queue)

        await MusicDB.findOneAndUpdate(
            { GuildID: guild.id },
            { repeatMode: (Mode = Mode ? (Mode == 2 ? 2 : 1) : 0) },
            { new: true, upsert: true }
        )

        return await interaction
            .editReply({
                content: `<:loop1:1265560917345570918> | 成功切換重複播放模式: ${
                    Mode
                        ? Mode == 2
                            ? '<:loop2:1265560938417754213>整個清單'
                            : '<:looponce:1265560956193210399>單曲'
                        : emojis.xmark
                }`
            })
            .then((msg) => deleteMessageAfter(msg, 10 * 1000))
    }
} satisfies ButtonType
