import Playlist from '@/Structures/Schemas/Playlist.js'
import { PaperClient } from '@/Structures/classes/PaperClient.js'
import { deleteMessageAfter } from '@/Systems/Music.js'
import emojis from '@/libs/emoji/emoji.js'
import type { ButtonType } from '@/typings/component'
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    MessageFlags
} from 'discord.js'

export default {
    id: 'playlist',
    async execute(interaction: ButtonInteraction, client: PaperClient) {
        const { customId } = interaction
        const [_, action] = customId.split(':')

        const player = client.moonlink?.players.get(interaction.guildId!)!
        const currentSong = player.queue.tracks[0]

        if (!player || !currentSong) {
            return await interaction
                .reply({
                    content: `${emojis.warning} | 目前沒有正在播放的歌曲`,
                    flags: MessageFlags.Ephemeral
                })
                .then(deleteMessageAfter)
        }

        try {
            switch (action) {
                case 'save': {
                    const playlists = await Playlist.find({
                        userId: interaction.user.id
                    }).select('name songs')

                    if (playlists.length === 0) {
                        return await interaction
                            .reply({
                                content: `${emojis.warning} | 你還沒有建立任何播放清單\n請嘗試使用 </playlist-create:1342789560765120530> 來建立一個`,
                                flags: MessageFlags.Ephemeral
                            })
                            .then(deleteMessageAfter)
                    }

                    const buttons = playlists.map((playlist) =>
                        new ButtonBuilder()
                            .setCustomId(`playlist:add:${playlist._id}`)
                            .setLabel(playlist.name)
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(
                                playlist.songs.some((song) => song.url === currentSong.uri)
                            )
                    )

                    const rows: any[] = []
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
                    const [__, ___, playlistId] = customId.split(':')
                    const playlist = await Playlist.findById(playlistId)

                    if (!playlist) {
                        return await interaction
                            .reply({
                                content: `${emojis.warning} | 找不到指定的播放清單`,
                                flags: MessageFlags.Ephemeral
                            })
                            .then(deleteMessageAfter)
                    }

                    if (playlist.songs.some((song) => song.url === currentSong.uri)) {
                        return await interaction
                            .reply({
                                content: `${emojis.warning} | 這首歌已經在播放清單中了`,
                                flags: MessageFlags.Ephemeral
                            })
                            .then(deleteMessageAfter)
                    }

                    playlist.songs.push({
                        title: currentSong.title,
                        url: currentSong.uri,
                        duration: currentSong.duration,
                        thumbnail: currentSong.thumbnail,
                        uploader: {
                            name: currentSong.author || 'Unknown'
                        }
                    })

                    await playlist.save()

                    await interaction.update({
                        content: `${emojis.correct} | 已將 **${currentSong.title}** 加入播放清單 **${playlist.name}**`,
                        components: []
                    })
                    break
                }
            }
        } catch (error) {
            console.error('處理播放清單按鈕時發生錯誤:', error)
            await interaction
                .reply({
                    content: `${emojis.outage} | 處理播放清單時發生錯誤`,
                    flags: MessageFlags.Ephemeral
                })
                .then(deleteMessageAfter)
        }
    }
} satisfies ButtonType
