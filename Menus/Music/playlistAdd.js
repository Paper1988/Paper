const { StringSelectMenuInteraction, MessageFlags } = require('discord.js')
const Playlist = require('../../Structures/Schemas/Playlist')
const { YouTubePlugin } = require('@distube/youtube')

module.exports = {
    id: 'playlist-add',
    /**
     *
     * @param {StringSelectMenuInteraction} interaction
     * @returns
     */
    async execute(interaction) {
        if (!interaction.isStringSelectMenu()) return
        const [_, userId, playlistName] = interaction.customId.split(':')
        const selectedSongUrl = interaction.values[0]

        const yt = new YouTubePlugin()
        const songDetails = await yt.searchSong(selectedSongUrl)

        const playlist = await Playlist.findOne({
            userId,
            name: playlistName
        })

        // 將歌曲的詳細信息添加到播放清單
        playlist.songs.push({
            title: songDetails.name,
            url: songDetails.url,
            duration: songDetails.duration,
            thumbnail: songDetails.thumbnail,
            addedAt: new Date()
        })
        await playlist.save()

        await interaction.reply({
            content: `**${songDetails.name}** 已成功加入播放清單`,
            flags: MessageFlags.Ephemeral
        })
    }
}
