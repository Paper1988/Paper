import emojis from '@/libs/emoji/emoji.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { deleteMessageAfter } from '@/Systems/Music.js'
import type { ButtonType } from '@/typings/component.js'
import { ButtonInteraction, EmbedBuilder, GuildMember } from 'discord.js'
import type { Player } from 'moonlink.js'

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

        const queue = player.queue

        const leftSongs = queue.tracks.length - 10

        const embed = new EmbedBuilder()
            .setColor('Purple')
            .setImage(queue.tracks[0]?.artworkUrl!)
            .setTimestamp()

        if (player.current) {
            embed.setDescription(
                `${emojis.queue} | 播放佇列\n**現在播放:** [${
                    player.current.title
                }](${player.current.uri}) | \` ${formatDuration(player.current.duration)} \``
            )
        }

        if (player.queue.size > 0) {
            const tracks = player.queue.tracks.map((track, index) => {
                return `**${index + 1}**. [${track.title}](${
                    track.uri
                }) | \` ${formatDuration(track.duration)} \``
            })

            embed.addFields({
                name: '接下來:',
                value: tracks.slice(0, 10).join('\n')
            })

            if (player.queue.size > 10) {
                embed.addFields({
                    name: '以及...',
                    value: `\` ${leftSongs} \` 首其他歌曲在佇列中`
                })
            }
        }

        return interaction.editReply({ embeds: [embed] })
    }
} satisfies ButtonType

const formatDuration = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60)
    const minutes = Math.floor((ms / (1000 * 60)) % 60)
    const hours = Math.floor(ms / (1000 * 60 * 60))

    return `${hours ? `${hours}:` : ''}${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}
