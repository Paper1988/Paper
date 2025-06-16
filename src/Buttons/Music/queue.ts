import type { PaperClient } from '@/classes/PaperClient'
import emojis from '@/libs/emoji/emoji'
import { deleteMessageAfter } from '@/Systems/Music'
import type { ButtonType } from '@/typings/component'
import { ButtonInteraction, EmbedBuilder, GuildMember } from 'discord.js'

export default {
    id: 'queue',
    async execute(interaction: ButtonInteraction, client: PaperClient) {
        await interaction.deferReply()
        const member = interaction.member! as GuildMember
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

        let leftSongs: number
        if (queue.songs.length - 10 > 0) {
            leftSongs = queue.songs.length - 10
        } else {
            leftSongs = 0
        }
        return await interaction
            .editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Purple')
                        .setDescription(
                            `<:queue:1265561609632485478> | 播放清單\n${queue.songs
                                .slice(0, 10)
                                .map(
                                    (song, id) =>
                                        `\n**${id + 1}**. \`${song.name}\` - \`${song.formattedDuration}\``
                                )}\n\n- \`和另外${leftSongs}首歌\``
                        )
                        .setImage(queue.songs[0]!.thumbnail!)
                        .setTimestamp()
                ]
            })
            .then((msg) => deleteMessageAfter(msg, 10 * 1000))
    }
} satisfies ButtonType
