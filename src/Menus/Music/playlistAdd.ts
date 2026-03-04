import Playlist from '@/Structures/Schemas/Playlist.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import emojis from '@/libs/emoji/emoji.js'
import { Logger } from '@/libs/utils/logger'
import type { MenuType } from '@/typings/component.js'
import { MessageFlags, type AnySelectMenuInteraction } from 'discord.js'
import type { Track } from 'moonlink.js'

export default {
    id: 'playlist-add',
    async execute(interaction: AnySelectMenuInteraction, client: PaperClient) {
        if (!interaction.isStringSelectMenu()) return
        const [_, userId, playlistName] = interaction.customId.split(':')
        const selectedSongUrl = interaction.values[0]

        if (!client.moonlink) {
            return interaction.reply({
                content: `${emojis.outage} | 發生未知錯誤`,
                flags: MessageFlags.Ephemeral
            })
        }

        try {
            const result = await client.moonlink.search({
                query: selectedSongUrl!,
                requester: interaction.user
            })

            if (!result.tracks.length || !result.tracks[0]) {
                return interaction.reply({
                    content: `${emojis.warning} | 找不到相關的歌曲`,
                    flags: MessageFlags.Ephemeral
                })
            }

            const track = result.tracks[0] as Track

            const playlist = await Playlist.findOne({
                userId,
                name: playlistName
            })

            if (!playlist) {
                return interaction.reply({
                    content: `${emojis.warning} | 找不到指定的播放清單`,
                    flags: MessageFlags.Ephemeral
                })
            }

            playlist.songs.push({
                title: track.title,
                url: track.uri,
                duration: track.duration,
                thumbnail: track.thumbnail,
                uploader: {
                    name: track.author || '未知'
                },
                addedAt: new Date()
            })

            await playlist.save()

            await interaction.reply({
                content: `**${track.title}** 已成功加入播放清單`,
                flags: MessageFlags.Ephemeral
            })
        } catch (error) {
            Logger.error('將歌曲加入播放清單時發生錯誤:', error)
            await interaction.reply({
                content: `${emojis.outage} | 將歌曲加入播放清單時發生錯誤`,
                flags: MessageFlags.Ephemeral
            })
        }
    }
} satisfies MenuType
