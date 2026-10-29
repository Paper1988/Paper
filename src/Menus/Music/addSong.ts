import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { MusicDbFetch, deleteMessageAfter, validateDJRole } from '@/Systems/Music.js'
import emojis from '@/libs/emoji/emoji.js'
import { Logger } from '@/libs/utils/logger.js'
import type { MenuType } from '@/typings/component.js'
import { GuildMember, MessageFlags, TextChannel, type AnySelectMenuInteraction } from 'discord.js'
import type { Player, Track } from 'moonlink.js'

export default {
    id: 'addSong',
    async execute(interaction: AnySelectMenuInteraction, client: PaperClient) {
        if (!(await validateDJRole(interaction, client))) return
        const songUrl = interaction.values[0]

        if (!interaction.member || !(interaction.member instanceof GuildMember)) {
            return interaction.reply({
                content: '此命令只能在伺服器中使用！',
                flags: MessageFlags.Ephemeral
            })
        }

        if (!interaction.channel || !(interaction.channel instanceof TextChannel)) {
            return interaction.reply({
                content: '此命令只能在伺服器文字頻道中使用！',
                flags: MessageFlags.Ephemeral
            })
        }

        const VoiceChannel = interaction.member.voice.channel

        if (!VoiceChannel) {
            return interaction.reply({
                content: `${emojis.warning} | 請先加入語音頻道`,
                flags: MessageFlags.Ephemeral
            })
        }

        if (!client.moonlink) {
            return interaction.reply({
                content: `${emojis.outage} | 發生未知錯誤`,
                flags: MessageFlags.Ephemeral
            })
        }

        try {
            const db = await MusicDbFetch(interaction.guild!)
            const currentPlayer = client.moonlink.players.get(interaction.guildId!) as Player

            let player: Player

            if (!currentPlayer) {
                player = client.moonlink.players.create({
                    guildId: interaction.guildId!,
                    voiceChannelId: VoiceChannel.id,
                    textChannelId: interaction.channel.id,
                    autoLeave: true,
                    autoPlay: db.autoplay ?? false,
                    loop: db.repeatMode ?? 'off',
                    volume: db.volume ?? 50
                })
            } else {
                player = currentPlayer
            }

            if (!player.connected) {
                player.connect({ selfDeaf: true })
            }

            const result = await client.moonlink.search({
                query: songUrl!,
                requester: interaction.user
            })

            if (!result.tracks.length || !result.tracks[0]) {
                return interaction.reply({
                    content: `${emojis.warning} | 找不到相關的歌曲`,
                    flags: MessageFlags.Ephemeral
                })
            }

            const track = result.tracks[0] as Track
            player.queue.add(track)

            if (!player.playing && !player.paused) {
                await player.play()
            }

            await interaction.reply({
                content: `**${track.title}** 已成功加入播放清單`,
                flags: MessageFlags.Ephemeral
            })
        } catch (error) {
            Logger.error('添加歌曲時發生錯誤:', error)
            await interaction.reply({
                content: `${emojis.outage} | 添加歌曲時發生錯誤`,
                flags: MessageFlags.Ephemeral
            })
        }
    }
} satisfies MenuType
