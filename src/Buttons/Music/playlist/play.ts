import Playlist from '@/Structures/Schemas/Playlist.js'
import { PaperClient } from '@/Structures/classes/PaperClient.js'
import { deleteMessageAfter, MusicDbFetch } from '@/Systems/Music.js'
import emojis from '@/libs/emoji/emoji.js'
import { Logger } from '@/libs/utils/logger'
import type { ButtonType } from '@/typings/component.js'
import { ButtonInteraction, EmbedBuilder, GuildMember, MessageFlags, TextChannel } from 'discord.js'
import type { Player, Track } from 'moonlink.js'

export default {
    id: 'playlist-play',
    async execute(interaction: ButtonInteraction, client: PaperClient) {
        /* return await interaction
            .reply({
                content: `${emojis.outage} | 音樂指令目前修復中！\n-# 造成不便，敬請見諒`
            })
            .then(deleteMessageAfter) */
        try {
            const [_, userId, playlistName] = interaction.customId.split(':')
            const member = interaction.member! as GuildMember
            const VoiceChannel = member.voice.channel!

            if (!member.voice.channel) {
                return await interaction
                    .reply({
                        content: `${emojis.warning} | 請先加入語音頻道`,
                        flags: MessageFlags.Ephemeral
                    })
                    .then(deleteMessageAfter)
            }

            const permissions = member.voice.channel.permissionsFor(interaction.client.user)!
            if (!permissions.has('Connect') || !permissions.has('Speak')) {
                return await interaction
                    .reply({
                        content: '',
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('拒絕請求')
                                .setDescription(
                                    `${emojis.warning} | 我沒有權限進入 <#${VoiceChannel.id}>!`
                                )
                                .setColor('Red')
                        ],
                        flags: MessageFlags.Ephemeral
                    })
                    .then(deleteMessageAfter)
            }

            const playlist = await Playlist.findOne({
                userId: userId,
                name: playlistName
            })

            if (!playlist) {
                return await interaction
                    .reply({
                        content: `${emojis.warning} | 找不到指定的播放清單`,
                        flags: MessageFlags.Ephemeral
                    })
                    .then(deleteMessageAfter)
            }

            if (playlist.isPrivate && playlist.userId !== interaction.user.id) {
                return await interaction
                    .reply({
                        content: `${emojis.warning} | 這是私人播放清單`,
                        flags: MessageFlags.Ephemeral
                    })
                    .then(deleteMessageAfter)
            }

            if (playlist.songs.length === 0) {
                return await interaction
                    .reply({
                        content: `${emojis.warning} | 播放清單是空的`,
                        flags: MessageFlags.Ephemeral
                    })
                    .then(deleteMessageAfter)
            }

            await interaction.reply({
                content: `${emojis.discord_loading} | 正在載入播放清單 **${playlistName}** 中的 ${playlist.songs.length} 首歌曲...`
            })

            if (!client.moonlink) {
                return await interaction
                    .editReply({
                        content: `${emojis.outage} | Moonlink 未初始化，無法播放音樂`
                    })
                    .then(deleteMessageAfter)
            }

            const db = await MusicDbFetch(interaction.guild!)
            const currentPlayer = client.moonlink.players.get(interaction.guildId!) as Player

            let player: Player

            if (!currentPlayer) {
                player = client.moonlink!.players.create({
                    guildId: interaction.guild!.id,
                    voiceChannelId: VoiceChannel.id,
                    textChannelId: interaction.channel!.id,
                    autoLeave: true,
                    autoPlay: db.autoplay ?? false,
                    loop: db.repeatMode ?? 0,
                    volume: db.volume ?? 50
                })
            } else {
                player = currentPlayer
            }

            if (!player.connected) {
                player.connect({ selfDeaf: true })
            }

            const tracks: Track[] = []
            const songUrls = playlist.songs.filter((song) => song.url).map((song) => song.url!)

            for (const url of songUrls) {
                try {
                    const result = await client.moonlink.search({
                        query: url,
                        requester: interaction.user,
                        source: 'youtube'
                    })

                    if (result.tracks.length > 0 && result.tracks[0]) {
                        tracks.push(result.tracks[0])
                    }
                } catch (error) {
                    Logger.error(`載入歌曲時發生錯誤 (${url}):`, error)
                }
            }

            if (tracks.length === 0) {
                return await interaction
                    .editReply({
                        content: `${emojis.warning} | 無法載入播放清單中的任何歌曲，可能是歌曲連結已失效`
                    })
                    .then(deleteMessageAfter)
            }

            player.queue.add(tracks)

            if (!player.playing && !player.paused) {
                await player.play()
            }

            playlist.plays++
            await playlist.save()

            await interaction
                .editReply({
                    content: `${emojis.correct} | 已將播放清單 **${playlistName}** 中的 ${tracks.length} 首歌曲加入播放佇列`
                })
                .then(deleteMessageAfter)
        } catch (error: any) {
            Logger.error('播放播放清單時發生錯誤:', error)
            await interaction
                .editReply({
                    content: `${emojis.outage} | 播放播放清單時發生錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`
                })
                .then(deleteMessageAfter)
        }
    }
} satisfies ButtonType
