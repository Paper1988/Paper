import { deleteMessageAfter } from '@/Systems/Music.js'
import type { PaperClient } from '@/classes/PaperClient.js'
import emojis from '@/libs/emoji/emoji.js'
import type { SubCommandType } from '@/typings/command.js'
import { ChatInputCommandInteraction, EmbedBuilder, GuildMember, TextChannel } from 'discord.js'
import { YouTubePlugin } from '@distube/youtube'
import { cacheGetJson } from '@/libs/utils/redis.js'

export default {
    subCommand: 'music.play',
    async execute(interaction: ChatInputCommandInteraction, client: PaperClient) {
        await interaction.reply({
            content: `${emojis.discord_loading} | 處理請求中...`
        })

        /* return await interaction.editReply({
            content: `${emojis.outage} | 音樂指令目前修復中！`
        }) */

        const { options, channel } = interaction
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

        // 檢查是否為 token（來自 autocomplete）
        let actualSearchValue = search
        if (search.startsWith('tk_')) {
            try {
                // 從 Redis 獲取 token 對應的歌曲資訊
                const trackInfo = await cacheGetJson<{ value: string }>(`ac:track:${search}`)

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

                // 使用 token 中的值作為搜尋內容
                actualSearchValue = trackInfo.value
            } catch (error) {
                console.error('解析 token 時發生錯誤:', error)
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
                    .then((msg) => setTimeout(() => msg.delete(), 15 * 1000))
            }
        }

        // 檢查是否為 YouTube 連結（用戶直接輸入）
        const youtubeRegex = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/
        if (youtubeRegex.test(search)) {
            // 如果是直接輸入的 YouTube 連結，阻擋播放
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

        const yt = new YouTubePlugin()

        if (actualSearchValue.startsWith('https://')) {
            client.distube
                .play(VoiceChannel, actualSearchValue, {
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
                        .then(deleteMessageAfter)
                )
        } else {
            try {
                const results = await yt.search(actualSearchValue, { limit: 1 })
                let songToPlay = results[0]

                if (!songToPlay) {
                    return await interaction.editReply({
                        content: `${emojis.warning} | 找不到相關的歌曲`
                    })
                }

                client.distube
                    .play(VoiceChannel, songToPlay, {
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
                            .then(deleteMessageAfter)
                    )
            } catch (error) {
                console.error('播放歌曲時發生錯誤:', error)
                return await interaction
                    .editReply({
                        content: `${emojis.outage} | 播放歌曲時發生錯誤，請稍後再試`
                    })
                    .then(deleteMessageAfter)
            }
        }
    }
} as SubCommandType
