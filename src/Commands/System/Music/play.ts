import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { MusicDbFetch, deleteMessageAfter } from '@/Systems/Music.js'
import emojis from '@/libs/emoji/emoji.js'
import { Logger } from '@/libs/utils/logger.js'
import { cacheDel, cacheGetJson } from '@/libs/utils/redis.js'
import type { SubCommandType } from '@/typings/command.js'
import { ChatInputCommandInteraction, EmbedBuilder, GuildMember, TextChannel } from 'discord.js'
import { Player, SearchResult, Track } from 'moonlink.js'

interface CachedTrack {
    title: string
    author: string
    duration: number
    uri: string
    identifier: string
    thumbnail?: string
    sourceName: string
}

export default {
    subCommand: 'music.play',
    async execute(interaction: ChatInputCommandInteraction, client: PaperClient) {
        const { options, channel, guild } = interaction
        const member = interaction.member! as GuildMember
        const VoiceChannel = member.voice.channel

        // const position = options.getNumber('position', false) ?? 0
        const skip = options.getBoolean('skip', false)
        const search = options.getString('search')!

        const embed = new EmbedBuilder().setColor('Red').setTitle('發生錯誤').setTimestamp()

        if (!client.moonlink) {
            return await interaction.reply({
                content: `${emojis.outage} | 音樂功能目前無法使用，請稍後再試。`
            })
        }

        await interaction.reply({
            content: `${emojis.discord_loading} | 處理請求中...`
        })

        /* return await interaction.editReply({
            content: `${emojis.outage} | 音樂指令目前修復中！`
        }) */

        if (!VoiceChannel) {
            return await interaction
                .editReply({
                    content: `${emojis.warning} | 你必須待在語音頻道裡面才能使用音樂指令!`
                })
                .then(deleteMessageAfter)
        }

        const currentPlayer = client.moonlink?.players.get(interaction.guildId!) as Player
        if (currentPlayer?.voiceChannelId && VoiceChannel.id !== currentPlayer.voiceChannelId) {
            return await interaction
                .editReply({
                    content: `${emojis.warning} | 我已經在語音頻道 - <#${currentPlayer.voiceChannelId}> 裡播放音樂了`
                })
                .then(deleteMessageAfter)
        }

        if (!VoiceChannel.joinable) {
            return await interaction
                .editReply({
                    content: '',
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('拒絕請求')
                            .setDescription(
                                `${emojis.warning} | 我沒有權限進入 <#${VoiceChannel.id}>!`
                            )
                            .setColor('Red')
                    ]
                })
                .then(deleteMessageAfter)
        }

        try {
            const db = await MusicDbFetch(guild!)

            let player: Player

            if (!currentPlayer) {
                player = client.moonlink.players.create({
                    guildId: guild!.id,
                    voiceChannelId: VoiceChannel.id,
                    textChannelId: channel!.id,
                    autoLeave: true,
                    autoPlay: db.autoplay,
                    loop: db.repeatMode ?? 'off',
                    volume: db.volume ?? 50
                })
            } else {
                player = currentPlayer
            }

            if (!player.connected) {
                await player.connect({ selfDeaf: true })
            }

            let trackToPlay: CachedTrack | null = null
            let actualSearchValue = search

            if (search.startsWith('tk_')) {
                try {
                    const trackInfo = await cacheGetJson<CachedTrack>(
                        `music:track:${interaction.user.id}:${search}`
                    )

                    if (!trackInfo) {
                        return await interaction
                            .editReply({
                                content: '',
                                embeds: [
                                    new EmbedBuilder()
                                        .setColor('Red')
                                        .setDescription(
                                            `${emojis.warning} | 此搜尋結果已過期，請重新搜尋歌曲。`
                                        )
                                ]
                            })
                            .then(deleteMessageAfter)
                    }

                    trackToPlay = trackInfo
                    actualSearchValue = trackToPlay.uri
                } catch (error) {
                    Logger.error('解析 token 時發生錯誤:', error)
                    return await interaction
                        .editReply({
                            content: '',
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('Red')
                                    .setDescription(
                                        `${emojis.warning} | 無法解析搜尋結果，請重新搜尋歌曲。`
                                    )
                            ]
                        })
                        .then(deleteMessageAfter)
                }
            }

            const youtubeRegex = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/
            if (!search.startsWith('tk_') && youtubeRegex.test(search)) {
                return await interaction
                    .editReply({
                        content: '',
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Red')
                                .setTitle('拒絕請求')
                                .setDescription(
                                    `${emojis.warning} | Discord禁止機器人播放來自Youtube的連結！請使用搜尋功能來播放歌曲。`
                                )
                        ]
                    })
                    .then(deleteMessageAfter)
            }

            const result = (await client.moonlink.search({
                query: actualSearchValue,
                requester: interaction.user.id
            })) as SearchResult

            if (result.isEmpty) {
                return await interaction
                    .editReply({
                        content: `${emojis.warning} | 找不到相關的歌曲`
                    })
                    .then(deleteMessageAfter)
            }

            switch (result.loadType) {
                case 'playlist':
                    player.queue.add(result.tracks)

                    player.setVolume(db.volume ?? 50)

                    if (skip && player.current) {
                        await player.skip()
                        await interaction.deleteReply()
                    } else if (!player.playing && !player.paused) {
                        await player.play()
                        await interaction.deleteReply()
                    }
                    break
                case 'search':
                case 'track': {
                    const track = result.tracks[0]
                    if (!track) break

                    player.queue.add(track)

                    if (skip && player.current) {
                        await player.skip()
                        await interaction.deleteReply()
                    } else if (!player.playing && !player.paused) {
                        await player.play()
                        await interaction.deleteReply()
                    }
                    break
                }
                case 'empty':
                    await interaction
                        .editReply({
                            content: `${emojis.warning} | 找不到相符的結果!`
                        })
                        .then(deleteMessageAfter)
                    break
                case 'error':
                    Logger.error('搜尋發生錯誤:', result.exception?.message ?? 'Unknown error')
                    await interaction
                        .editReply({
                            content: `${emojis.outage} | 發生未知錯誤，請稍後再試!`
                        })
                        .then(deleteMessageAfter)
                    break
            }

            if (search.startsWith('tk_')) {
                await cacheDel(`music:track:${interaction.user.id}:${search}`)
            }
        } catch (error) {
            Logger.error('播放歌曲時發生錯誤:', error)

            return await interaction
                .editReply({
                    content: '',
                    embeds: [
                        embed.setDescription(
                            `${emojis.outage} | 播放歌曲時發生錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`
                        )
                    ]
                })
                .then(deleteMessageAfter)
        }
    }
} as SubCommandType
