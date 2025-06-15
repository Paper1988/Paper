import Playlist from '@/Structures/Schemas/Playlist'
import type { MenuType } from '@/typings/component'
import { YouTubePlugin } from '@distube/youtube'
import { MessageFlags, type AnySelectMenuInteraction } from 'discord.js'

export default {
    id: 'playlist-add',
    async execute(interaction: AnySelectMenuInteraction) {
        if (!interaction.isStringSelectMenu()) return
        const [_, userId, playlistName] = interaction.customId.split(':')
        const selectedSongUrl = interaction.values[0]

        const yt = new YouTubePlugin()
        const songs = await yt.search(selectedSongUrl!, { limit: 1 })
        const song = songs[0]!

        const playlist = await Playlist.findOne({
            userId,
            name: playlistName
        })

        // 將歌曲的詳細訊息添加到播放清單
        playlist!.songs.push({
            title: song.name,
            url: song.url,
            duration: song.duration,
            thumbnail: song.thumbnail,
            addedAt: new Date()
        })
        // 更新播放清單
        await playlist!.save()

        await interaction.reply({
            content: `**${song.name}** 已成功加入播放清單`,
            flags: MessageFlags.Ephemeral
        })
    }
} satisfies MenuType
