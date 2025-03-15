const { YouTubePlugin } = require('@distube/youtube')
const { ChatInputCommandInteraction, Client, EmbedBuilder, MessageFlags } = require('discord.js')
const { emojis } = require('../../../../libs/emoji/emoji')
const Playlist = require('../../../../Structures/Schemas/Playlist')

module.exports = {
    subCommand: 'music.play',
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        await interaction.reply({
            content: '<a:discord1792loading:1212016238839070791> | 處理請求中...'
        })
        const { options, channel, member } = interaction
        const VoiceChannel = member.voice.channel

        const position = options.getNumber('position', false) ?? undefined
        const skip = options.getBoolean('skip', false)
        const search = options.getString('search')

        const embed = new EmbedBuilder().setColor('Red').setTitle('發生錯誤').setTimestamp()

        if (!VoiceChannel)
            return await interaction.editReply({
                content: `${emojis.warning} | 你必須待在語音頻道裡面才能使用音樂指令!`,
                flags: MessageFlags.Ephemeral
            })

        if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
            return await interaction.editReply({
                content: `${emojis.warning} | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`,
                flags: MessageFlags.Ephemeral
            })

        if (!VoiceChannel.joinable) {
            return await interaction.editReply({
                content: '',
                embeds: [
                    new EmbedBuilder()
                        .setTitle('拒絕請求')
                        .setDescription(`${emojis.warning} | 我沒有權限進入 <#${VoiceChannel.id}>!`)
                        .setColor('Red')
                ],
                flags: MessageFlags.Ephemeral
            })
        }

        await client.distube.voices.join(VoiceChannel)

        // 檢查是否為播放清單ID (格式: userId:playlistName)
        // 使用正則表達式來確保格式正確
        const playlistPattern = /^\d{17,19}:[^:]+$/
        if (playlistPattern.test(search)) {
            const [userId, playlistName] = search.split(':')
            try {
                const playlist = await Playlist.findOne({
                    userId: userId,
                    name: playlistName
                })

                if (!playlist) {
                    return await interaction.editReply({
                        content: `${emojis.warning} | 找不到指定的播放清單`,
                        flags: MessageFlags.Ephemeral
                    })
                }

                if (playlist.isPrivate && playlist.userId !== interaction.user.id) {
                    return await interaction.editReply({
                        content: `${emojis.warning} | 這是私人播放清單`,
                        flags: MessageFlags.Ephemeral
                    })
                }

                if (playlist.songs.length === 0) {
                    return await interaction.editReply({
                        content: `${emojis.warning} | 播放清單是空的`,
                        flags: MessageFlags.Ephemeral
                    })
                }

                const NewPlaylist = await interaction.client.distube.createCustomPlaylist(
                    playlist.songs.map((song) => song.url)
                )

                await interaction.client.distube.play(
                    interaction.member.voice.channel,
                    NewPlaylist,
                    {
                        member: interaction.member,
                        textChannel: interaction.channel,
                        metadata: { interaction }
                    }
                )

                // 更新播放次數
                playlist.plays++
                await playlist.save()

                await interaction.editReply({
                    content: `${emojis.correct} | 已將播放清單 **${playlistName}** 中的 ${playlist.songs.length} 首歌曲加入播放佇列`
                })
            } catch (error) {
                console.error('播放播放清單時發生錯誤:', error)
                if (error.message?.includes('playFromSource')) {
                    return await interaction.editReply({
                        content: `${emojis.outage} | 無法播放歌曲，可能是播放清單中的歌曲連結已失效`,
                        flags: MessageFlags.Ephemeral
                    })
                }
                await interaction.editReply({
                    content: `${emojis.outage} | 播放播放清單時發生錯誤`,
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(
                                `${emojis.outage} | 播放播放清單時發生錯誤，請協助回報！`
                            )
                    ],
                    flags: MessageFlags.Ephemeral
                })
            }
            return
        }

        // 一般歌曲播放邏輯
        const yt = new YouTubePlugin()

        if (search.startsWith('https://')) {
            client.distube
                .play(VoiceChannel, search, {
                    textChannel: channel,
                    member: member,
                    position,
                    skip
                })
                .then(() => interaction.deleteReply())
        } else {
            const results = await yt.searchSong(search)

            client.distube
                .play(VoiceChannel, results[0], {
                    textChannel: channel,
                    member: member,
                    position,
                    skip
                })
                .then(() => interaction.deleteReply())
                .catch((err) =>
                    interaction
                        .editReply({
                            embeds: [embed.setDescription(`${emojis.warning} | ` + err)]
                        })
                        .then(() => setTimeout(() => interaction.deleteReply(), 15 * 1000))
                )
        }

        /* return await interaction
                .editReply({
                    content: '',
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setTitle('拒絕請求')
                            .setDescription(
                                `${emojis.warning} | Discord禁止機器人播放來自Youtube的連結！請嘗試使用其他平台的音樂連結。`
                            )
                    ]
                })
                .then((msg) => setTimeout(() => msg.delete(), 15 * 1000)) */
    }
}
