import emojis from '@/libs/emoji/emoji.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { deleteMessageAfter, validateVoiceChannel } from '@/Systems/Music.js'
import type { ButtonType } from '@/typings/component.js'
import { ButtonInteraction, EmbedBuilder, GuildMember } from 'discord.js'
import type { Player } from 'moonlink.js'

export default {
    id: 'queue',
    async execute(interaction: ButtonInteraction, client: PaperClient) {
        await interaction.deferReply()
        const member = interaction.member! as GuildMember
        const VoiceChannel = member.voice.channel

        if (!(await validateVoiceChannel(interaction, client, VoiceChannel))) return

        const player = client.moonlink?.players.get(interaction.guildId!) as Player
        if (!player || !player.current) {
            return await interaction
                .editReply({
                    content: `${emojis.warning} | 目前沒有正在播放的音樂!`
                })
                .then(deleteMessageAfter)
        }

        const queue = player.queue

        const leftSongs = queue.tracks.length - 10

        const embed = new EmbedBuilder()
            .setColor('Purple')
            .setImage(player.current?.artworkUrl!)
            .setTimestamp()

        if (player.current) {
            embed.setDescription(
                `${emojis.queue} | 播放佇列\n**現在播放:** [${player.current.title}](${player.current.uri}) | \` ${formatDuration(player.current.duration)} \``
            )
        } else {
            embed.setDescription(`${emojis.queue} | 播放佇列\n**現在播放:** 暫無歌曲`)
        }

        if (player.queue.size > 0) {
            const tracks = player.queue.tracks.map((track, index) => {
                return `**${index + 1}**. [${track.title}](${track.uri}) | \` ${formatDuration(track.duration)} \``
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
