const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
    ButtonInteraction
} = require('discord.js')
const Playlist = require('../../../Structures/Schemas/Playlist')
const { emojis } = require('../../../libs/emoji/emoji')

module.exports = {
    id: 'playlist',
    /**
     *
     * @param {ButtonInteraction} interaction
     * @returns
     */
    async execute(interaction) {
        const { customId } = interaction
        const [_, action] = customId.split(':')

        const queue = interaction.client.distube.getQueue(interaction.guildId)
        const currentSong = queue.songs[0]

        if (!queue || !currentSong) {
            return await interaction.reply({
                content: `${emojis.warning} | 目前沒有正在播放的歌曲`,
                flags: MessageFlags.Ephemeral
            })
        }

        try {
            switch (action) {
                case 'save': {
                    // 顯示用戶的播放清單選項
                    const playlists = await Playlist.find({
                        userId: interaction.user.id
                    }).select('name songs')

                    if (playlists.length === 0) {
                        return await interaction.reply({
                            content: `${emojis.warning} | 你還沒有建立任何播放清單\n請嘗試使用 </playlist-create:1342789560765120530> 來建立一個`,
                            flags: MessageFlags.Ephemeral
                        })
                    }

                    const buttons = playlists.map((playlist) =>
                        new ButtonBuilder()
                            .setCustomId(`playlist:add:${playlist._id}`)
                            .setLabel(playlist.name)
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(
                                playlist.songs.some((song) => song.url === currentSong.url)
                            )
                    )

                    const rows = []
                    for (let i = 0; i < buttons.length; i += 5) {
                        rows.push(new ActionRowBuilder().addComponents(buttons.slice(i, i + 5)))
                    }

                    await interaction.reply({
                        content: '選擇要將歌曲加入的播放清單：',
                        components: rows.slice(0, 5),
                        flags: MessageFlags.Ephemeral
                    })
                    break
                }

                case 'add': {
                    const [_, __, playlistId] = customId.split(':')
                    const playlist = await Playlist.findById(playlistId)

                    if (!playlist) {
                        return await interaction.reply({
                            content: `${emojis.warning} | 找不到指定的播放清單`,
                            flags: MessageFlags.Ephemeral
                        })
                    }

                    // 檢查歌曲是否已在播放清單中
                    if (playlist.songs.some((song) => song.url === currentSong.url)) {
                        return await interaction.reply({
                            content: `${emojis.warning} | 這首歌已經在播放清單中了`,
                            flags: MessageFlags.Ephemeral
                        })
                    }

                    // 添加歌曲到播放清單
                    playlist.songs.push({
                        title: currentSong.name,
                        url: currentSong.url,
                        duration: currentSong.duration,
                        thumbnail: currentSong.thumbnail,
                        uploader: {
                            name: currentSong.uploader?.name || 'Unknown',
                            url: currentSong.uploader?.url || null
                        }
                    })

                    await playlist.save()

                    await interaction.update({
                        content: `${emojis.correct} | 已將 **${currentSong.name}** 加入播放清單 **${playlist.name}**`,
                        components: []
                    })
                    break
                }
            }
        } catch (error) {
            console.error('處理播放清單按鈕時發生錯誤:', error)
            await interaction.reply({
                content: `${emojis.outage} | 處理播放清單時發生錯誤`,
                flags: MessageFlags.Ephemeral
            })
        }
    }
}
