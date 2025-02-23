const { MessageFlags, ButtonInteraction } = require('discord.js')
const Playlist = require('../../../Structures/Schemas/Playlist')
const { emojis } = require('../../../libs/emoji/emoji')
const { YouTubePlugin } = require('@distube/youtube')

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

            // 檢查用戶是否在語音頻道
            if (!interaction.member.voice.channel) {
                return await interaction
                    .reply({
                        content: `${emojis.warning} | 請先加入語音頻道`,
                        flags: MessageFlags.Ephemeral
                    })
                    .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
            }

            // 檢查機器人權限
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

            // 獲取播放清單
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

            // 檢查是否為私人播放清單
            if (playlist.isPrivate && playlist.userId !== interaction.user.id) {
                return await interaction.reply({
                    content: `${emojis.warning} | 這是私人播放清單`,
                    flags: MessageFlags.Ephemeral
                })
            }

            // 檢查播放清單是否為空
            if (playlist.songs.length === 0) {
                return await interaction
                    .reply({
                        content: `${emojis.warning} | 播放清單是空的`,
                        flags: MessageFlags.Ephemeral
                    })
                    .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
            }

            const yt = new YouTubePlugin()

            // 播放清單中的所有歌曲
            const queue = interaction.client.distube.getQueue(interaction.guildId)

            await interaction.reply({
                content: `${emojis.discord_loading} | 正在載入播放清單 **${playlistName}** 中的 ${playlist.songs.length} 首歌曲...`
            })

            // 如果已有播放佇列，則添加到佇列中
            if (queue) {
                // 將播放清單歌曲轉換為 DisTube 可接受的格式
                const songs = playlist.songs.map(async (song) => await yt.search(song))

                // 將每首歌曲逐一添加到佇列
                for (const song of songs) {
                    await queue.addToQueue(song) // 將每首歌曲添加到佇列
                }
            } else {
                // 如果沒有佇列，則創建新的佇列
                await interaction.client.distube.play(
                    interaction.member.voice.channel,
                    playlist.songs[0].title,
                    {
                        member: interaction.member,
                        textChannel: interaction.channel,
                        metadata: { interaction }
                    }
                )

                // 添加剩餘的歌曲
                if (playlist.songs.length > 1) {
                    const queue = interaction.client.distube.getQueue(interaction.guildId)
                    const remainingSongs = playlist.songs
                        .slice(1)
                        .map(async (song) => await yt.search(song))

                    // 將剩餘的歌曲逐一添加到佇列
                    for (const song of remainingSongs) {
                        await queue.addToQueue(song) // 將每首歌曲添加到佇列
                    }
                }
            }

            // 更新播放次數
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
