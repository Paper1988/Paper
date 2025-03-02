const { MessageFlags, ButtonInteraction } = require('discord.js')
const Playlist = require('../../../Structures/Schemas/Playlist')
const { emojis } = require('../../../libs/emoji/emoji')

module.exports = {
    id: 'playlist-play',
    /**
     *
     * @param {ButtonInteraction} interaction
     * @returns
     */
    async execute(interaction) {
        try {
            const [_, userId, playlistName] = interaction.customId.split(':')

            if (!interaction.member.voice.channel) {
                return await interaction
                    .reply({
                        content: `${emojis.warning} | 請先加入語音頻道`,
                        flags: MessageFlags.Ephemeral
                    })
                    .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
            }

            const permissions = interaction.member.voice.channel.permissionsFor(
                interaction.client.user
            )
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
                    .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
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
                    .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
            }

            if (playlist.isPrivate && playlist.userId !== interaction.user.id) {
                return await interaction.reply({
                    content: `${emojis.warning} | 這是私人播放清單`,
                    flags: MessageFlags.Ephemeral
                })
            }

            if (playlist.songs.length === 0) {
                return await interaction
                    .reply({
                        content: `${emojis.warning} | 播放清單是空的`,
                        flags: MessageFlags.Ephemeral
                    })
                    .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
            }

            await interaction.reply({
                content: `${emojis.discord_loading} | 正在載入播放清單 **${playlistName}** 中的 ${playlist.songs.length} 首歌曲...`
            })

            const NewPlaylist = await interaction.client.distube.createCustomPlaylist(
                playlist.songs.map((song) => song.url)
            )

            await interaction.client.distube.play(interaction.member.voice.channel, NewPlaylist, {
                member: interaction.member,
                textChannel: interaction.channel,
                metadata: { interaction }
            })

            playlist.plays++
            await playlist.save()

            await interaction
                .editReply({
                    content: `${emojis.correct} | 已將播放清單 **${playlistName}** 中的 ${playlist.songs.length} 首歌曲加入播放佇列`
                })
                .then(() => setTimeout(() => interaction.deleteReply(), 10 * 1000))
        } catch (error) {
            console.error('播放播放清單時發生錯誤:', error)
            // 如果是播放源錯誤，給出更具體的提示
            if (error.message?.includes('playFromSource')) {
                return await interaction
                    .editReply({
                        content: `${emojis.outage} | 無法播放歌曲，可能是播放清單中的歌曲連結已失效`,
                        flags: MessageFlags.Ephemeral
                    })
                    .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
            }

            await interaction
                .editReply({
                    content: `${emojis.outage} | 播放播放清單時發生錯誤`,
                    flags: MessageFlags.Ephemeral
                })
                .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
        }
    }
}
