import Playlist from '@/Structures/Schemas/Playlist.js'
import { deleteMessageAfter } from '@/Systems/Music.js'
import emojis from '@/libs/emoji/emoji.js'
import type { ButtonType } from '@/typings/component.js'
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    EmbedBuilder,
    MessageFlags
} from 'discord.js'

export default {
    id: 'playlist-page',
    async execute(interaction: ButtonInteraction) {
        const [_, userId, playlistName, action, currentPage] = interaction.customId.split(':')
        const page = parseInt(currentPage!)
        const songsPerPage = 10

        try {
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
                    .then((msg) => deleteMessageAfter(msg, 10 * 1000))
            }

            if (playlist.isPrivate && playlist.userId !== interaction.user.id) {
                return await interaction
                    .reply({
                        content: `${emojis.warning} | 這是私人播放清單`,
                        flags: MessageFlags.Ephemeral
                    })
                    .then((msg) => deleteMessageAfter(msg, 10 * 1000))
            }

            const totalPages = Math.ceil(playlist.songs.length / songsPerPage)
            let newPage = action === 'next' ? page + 1 : page - 1

            if (newPage < 1) newPage = totalPages
            if (newPage > totalPages) newPage = 1

            const startIdx = (newPage - 1) * songsPerPage
            const endIdx = Math.min(startIdx + songsPerPage, playlist.songs.length)

            const embed = EmbedBuilder.from(interaction.message.embeds[0]!)
                .spliceFields(-1, 1, {
                    name: '<:todolist:1320296314071945267> 歌曲列表',
                    value: playlist.songs
                        .slice(startIdx, endIdx)
                        .map(
                            (song, index) =>
                                `${startIdx + index + 1}. [${song.title}](${song.url}) (${
                                    song.duration! / 60
                                }:${(song.duration! % 60).toString().padStart(2, '0')})`
                        )
                        .join('\n')
                })
                .setFooter({
                    text: `第 ${newPage}/${totalPages} 頁 • 建立於 ${playlist.createdAt.toLocaleDateString()}`
                })

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId(
                        `playlist-page:${playlist.userId}:${playlist.name}:prev:${newPage}`
                    )
                    .setLabel('上一頁')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(newPage === 1),
                new ButtonBuilder()
                    .setCustomId(
                        `playlist-page:${playlist.userId}:${playlist.name}:next:${newPage}`
                    )
                    .setLabel('下一頁')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(newPage === totalPages),
                new ButtonBuilder()
                    .setCustomId(`playlist-play:${playlist.userId}:${playlist.name}`)
                    .setLabel('播放全部')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('<:play:1265561505458294826>')
            )

            await interaction.update({
                embeds: [embed],
                components: [row]
            })
        } catch (error) {
            console.error('處理播放清單分頁時發生錯誤:', error)
            await interaction
                .reply({
                    content: `${emojis.outage} | 處理分頁時發生錯誤`,
                    flags: MessageFlags.Ephemeral
                })
                .then((msg) => deleteMessageAfter(msg, 10 * 1000))
        }
    }
} satisfies ButtonType
