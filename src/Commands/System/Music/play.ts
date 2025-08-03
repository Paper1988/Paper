import Playlist from '@/Structures/Schemas/Playlist.js'
import { deleteMessageAfter } from '@/Systems/Music'
import type { PaperClient } from '@/classes/PaperClient.js'
import emojis from '@/libs/emoji/emoji.js'
import type { SubCommandType } from '@/typings/command.js'
import { YouTubePlugin } from '@distube/youtube'
import { ChatInputCommandInteraction, EmbedBuilder, GuildMember, TextChannel } from 'discord.js'

export default {
    subCommand: 'music.play',
    async execute(interaction: ChatInputCommandInteraction, client: PaperClient) {
        await interaction.reply({
            content: '<a:discord1792loading:1212016238839070791> | 處理請求中...'
        })
        return await interaction
            .editReply({
                content: `${emojis.outage} | 音樂指令目前修復中！\n-# 造成不便，敬請見諒`
            })
            .then(deleteMessageAfter)
        /* const { options, channel } = interaction
        const member = interaction.member! as GuildMember
        const VoiceChannel = member.voice.channel

        const position = options.getNumber('position', false) ?? undefined
        const skip = options.getBoolean('skip', false)
        const search = options.getString('search')!

        const embed = new EmbedBuilder().setColor('Red').setTitle('發生錯誤').setTimestamp()

        if (!VoiceChannel) {
            return await interaction.editReply({
                content: `${emojis.warning} | 你必須待在語音頻道裡面才能使用音樂指令!`
            })
        }

        const currentVoiceChannel = interaction.guild?.members.me?.voice.channelId
        if (currentVoiceChannel && VoiceChannel.id !== currentVoiceChannel) {
            return await interaction.editReply({
                content: `${emojis.warning} | 我已經在語音頻道 - <#${currentVoiceChannel}> 裡播放音樂了`
            })
        }

        if (!VoiceChannel.joinable) {
            return await interaction.editReply({
                content: '',
                embeds: [
                    new EmbedBuilder()
                        .setTitle('拒絕請求')
                        .setDescription(`${emojis.warning} | 我沒有權限進入 <#${VoiceChannel.id}>!`)
                        .setColor('Red')
                ]
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
                        content: `${emojis.warning} | 找不到指定的播放清單`
                    })
                }

                if (playlist.isPrivate && playlist.userId !== interaction.user.id) {
                    return await interaction.editReply({
                        content: `${emojis.warning} | 這是私人播放清單`
                    })
                }

                if (playlist.songs.length === 0) {
                    return await interaction.editReply({
                        content: `${emojis.warning} | 播放清單是空的`
                    })
                }

                const NewPlaylist = await client.distube.createCustomPlaylist(
                    playlist.songs.map((song) => song.url!)
                )

                await client.distube.play(
                    (interaction.member! as GuildMember).voice.channel!,
                    NewPlaylist,
                    {
                        member: interaction.member! as GuildMember,
                        textChannel: interaction.channel! as TextChannel,
                        metadata: { interaction }
                    }
                )

                // 更新播放次數
                playlist.plays++
                await playlist.save()

                await interaction.editReply({
                    content: `${emojis.correct} | 已將播放清單 **${playlistName}** 中的 ${playlist.songs.length} 首歌曲加入播放佇列`
                })
            } catch (error: any) {
                console.error('播放播放清單時發生錯誤:', error)
                if (error.message?.includes('playFromSource')) {
                    return await interaction.editReply({
                        content: `${emojis.outage} | 無法播放歌曲，可能是播放清單中的歌曲連結已失效`
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
                    ]
                })
            }
            return
        }

        // 一般歌曲播放邏輯
        const youtubeRegex = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/
        const yt = new YouTubePlugin()

        if (!youtubeRegex.test(search)) {
            if (search.startsWith('https://')) {
                client.distube
                    .play(VoiceChannel, search, {
                        textChannel: channel! as TextChannel,
                        member: member,
                        position,
                        skip: skip!,
                        metadata: interaction
                    })
                    .then(() => interaction.deleteReply())
            } else {
                const results = await yt.search(search, { limit: 1 })
                const result = results[0]

                client.distube
                    .play(VoiceChannel, result!, {
                        textChannel: channel! as TextChannel,
                        member: member,
                        position,
                        skip: skip!,
                        metadata: interaction
                    })
                    .then(() => interaction.deleteReply())
                    .catch((err) =>
                        interaction
                            .editReply({
                                content: '',
                                embeds: [embed.setDescription(`${emojis.warning} | ` + err)]
                            })
                            .then(() => setTimeout(() => interaction.deleteReply(), 15 * 1000))
                    )
            }
        } else {
            return await interaction
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
                .then((msg) => setTimeout(() => msg.delete(), 15 * 1000))
        } */
    }
} as SubCommandType
