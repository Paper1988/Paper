import emojis from '@/libs/emoji/emoji.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import MusicDB from '@/Structures/Schemas/MusicDB.js'
import {
    clearPlayer,
    deleteMessageAfter,
    updateMusicPlayerStatus,
    validateVoiceChannel
} from '@/Systems/Music.js'
import type { SubCommandType } from '@/typings/command.js'
import { ChatInputCommandInteraction, EmbedBuilder, GuildMember, MessageFlags } from 'discord.js'
import type { Player } from 'moonlink.js'

export default {
    subCommand: 'music.settings',
    async execute(interaction: ChatInputCommandInteraction, client: PaperClient) {
        const { options } = interaction
        const member = interaction.member! as GuildMember
        const VoiceChannel = member.voice.channel

        if (!(await validateVoiceChannel(interaction, client, VoiceChannel))) return

        const player = client.moonlink?.players.get(interaction.guildId!) as Player
        if (!player || !player.current) {
            return await interaction
                .reply({
                    content: `${emojis.warning} | 目前沒有正在播放的音樂!`,
                    flags: MessageFlags.Ephemeral
                })
                .then(deleteMessageAfter)
        }

        const queue = player.queue

        let Mode: boolean
        let normalizedMode: number
        let leftSongs: number

        switch (options.getString('options')) {
            case 'skip':
                if (!queue.tracks[0] && !player.autoPlay) {
                    return interaction.reply({
                        content: `${emojis.outage} | 這是最後一首歌了!`
                    })
                }
                await player.skip()
                return interaction.reply({
                    content: `${emojis.frontforward} | 成功跳過歌曲`
                })

            case 'stop':
                await player.stop()
                await updateMusicPlayerStatus(player, client, true)
                player.queue.clear()
                clearPlayer(player)
                await player.disconnect()

                return interaction.reply({
                    content: '<:stop:1265562218498363422> | 成功停止音樂並退出語音頻道'
                })

            case 'togglePause':
                if (!player.paused) {
                    await player.pause()
                    return interaction.reply({
                        content: '<:pause:1265561390358331462> | 成功暫停播放歌曲'
                    })
                } else {
                    await player.resume()
                    return interaction.reply({
                        content: '<:play:1265561505458294826> | 成功恢復播放歌曲'
                    })
                }

            case 'shuffle':
                player.queue.shuffle()
                return interaction.reply({
                    content: '<:shuffle:1265561846690222081> | 成功隨機播放歌曲'
                })

            case 'autoplay':
                if (player.autoPlay) player.setAutoPlay(true)
                else player.setAutoPlay(false)

                Mode = player.autoPlay
                await MusicDB.findOneAndUpdate(
                    { GuildID: player.guildId },
                    { autoplayMode: Mode ? true : false },
                    { returnDocument: 'after', upsert: true }
                )
                return interaction.reply({
                    content: `<:update:1265562455828987968> | 成功切換自動播放模式: ${
                        Mode ? emojis.correct : emojis.xmark
                    }`
                })

            case 'previous':
                await player.back()
                return interaction.reply({
                    content: `${emojis.backforward} | 成功播放上一首歌曲`
                })

            case 'repeat':
                switch (player.loop) {
                    case 'off':
                        player.setLoop('track')
                        break
                    case 'track':
                        player.setLoop('queue')
                        break
                    case 'queue':
                        player.setLoop('off')
                        break
                }
                normalizedMode = player.loop === 'off' ? 0 : player.loop === 'track' ? 1 : 2

                await MusicDB.findOneAndUpdate(
                    { GuildID: player.guildId },
                    { repeatMode: normalizedMode },
                    { returnDocument: 'after', upsert: true }
                )
                return interaction.reply({
                    content: `<:loop1:1265560917345570918> | 成功切換重複播放模式: ${
                        normalizedMode
                            ? normalizedMode == 2
                                ? '<:loop2:1265560938417754213>整個清單'
                                : '<:looponce:1265560956193210399>單曲'
                            : emojis.xmark
                    }`
                })

            case 'queue':
                leftSongs = queue.tracks.length - 10

                const embed = new EmbedBuilder()
                    .setColor('Purple')
                    .setImage(queue.tracks[0]?.artworkUrl!)
                    .setTimestamp()

                if (player.current) {
                    embed.setDescription(
                        `${emojis.queue} | 播放佇列\n**現在播放:** [${
                            player.current.title
                        }](${player.current.uri}) | \` ${formatDuration(
                            player.current.duration
                        )} \``
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

                return interaction.reply({ embeds: [embed] })
        }
    }
} as SubCommandType

const formatDuration = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60)
    const minutes = Math.floor((ms / (1000 * 60)) % 60)
    const hours = Math.floor(ms / (1000 * 60 * 60))

    return `${hours ? `${hours}:` : ''}${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}
