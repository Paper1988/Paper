import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { deleteMessageAfter, validateVoiceChannel } from '@/Systems/Music.js'
import emojis from '@/libs/emoji/emoji.js'
import { Logger } from '@/libs/utils/logger.js'
import { cacheDel, cacheGetJson } from '@/libs/utils/redis.js'
import type { SubCommandType } from '@/typings/command.js'
import { ChatInputCommandInteraction, EmbedBuilder, GuildMember } from 'discord.js'
import { Player, SearchResult } from 'moonlink.js'

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

        const skip = options.getBoolean('skip', false)
        const search = options.getString('search')!

        await interaction.reply({
            content: `${emojis.discord_loading} | 處理請求中...`
        })

        if (!(await validateVoiceChannel(interaction, client, VoiceChannel))) return

        try {
            const player = await getOrCreatePlayer(client, guild!.id, VoiceChannel!.id, channel!.id)

            const actualSearchValue = await resolveSearchQuery(interaction, search)
            if (!actualSearchValue) return

            const result = (await client.moonlink!.search({
                query: actualSearchValue,
                requester: interaction.user.id
            })) as SearchResult

            if (!(await validateSearchResult(interaction, result))) return

            addTracksToQueue(player, result)
            await handlePlayback(player, skip)

            await interaction.deleteReply().catch(() => {})

            if (search.startsWith('tk_')) {
                await cacheDel(`music:track:${interaction.user.id}:${search}`)
            }
        } catch (error) {
            handlePlaybackError(interaction, error)
        }
    }
} as SubCommandType

/**
 * 取得或建立音樂播放器
 */
async function getOrCreatePlayer(
    client: PaperClient,
    guildId: string,
    voiceChannelId: string,
    textChannelId: string
): Promise<Player> {
    let player = client.moonlink!.players.get(guildId) as Player
    if (!player) {
        player = client.moonlink!.players.create({
            guildId,
            voiceChannelId,
            textChannelId
        })
    }
    if (!player.connected) {
        await player.connect({ selfDeaf: true })
    }
    return player
}

/**
 * 解析使用者的搜尋字串 (處理 Token 以及 YouTube 阻擋)
 */
async function resolveSearchQuery(
    interaction: ChatInputCommandInteraction,
    search: string
): Promise<string | null> {
    if (search.startsWith('tk_')) {
        const trackInfo = await cacheGetJson<CachedTrack>(
            `music:track:${interaction.user.id}:${search}`
        ).catch((error) => {
            Logger.error('解析 token 時發生錯誤:', error)
            return null
        })

        if (!trackInfo) {
            await interaction
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
            return null
        }
        return trackInfo.uri
    }

    const cleanUrl = sanitizeSpotifyUrl(search)
    const isYouTube = cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')

    if (isYouTube) {
        await interaction
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
        return null
    }

    return cleanUrl
}

/**
 * 驗證搜尋結果是否有效
 */
async function validateSearchResult(
    interaction: ChatInputCommandInteraction,
    result: SearchResult
): Promise<boolean> {
    if (result.isEmpty || result.loadType === 'empty') {
        await interaction
            .editReply({ content: `${emojis.warning} | 找不到相關的歌曲` })
            .then(deleteMessageAfter)
        return false
    }

    if (result.isError || result.loadType === 'error') {
        Logger.error('搜尋發生錯誤:', result.exception?.message ?? 'Unknown error')
        await interaction
            .editReply({ content: `${emojis.outage} | 發生未知錯誤，請稍後再試!` })
            .then(deleteMessageAfter)
        return false
    }

    return true
}

/**
 * 將歌曲加入播放清單
 */
function addTracksToQueue(player: Player, result: SearchResult): void {
    if (result.isPlaylist || result.loadType === 'playlist') {
        player.queue.add(result.tracks)
    } else {
        const track = result.tracks[0]
        if (track) player.queue.add(track)
    }
}

/**
 * 處理播放與跳過邏輯
 */
async function handlePlayback(player: Player, skip: boolean | null): Promise<void> {
    if (skip && player.current) {
        await player.skip()
    } else if (!player.playing && !player.paused) {
        await player.play()
    }
}

/**
 * 處理播放失敗的錯誤
 */
async function handlePlaybackError(interaction: ChatInputCommandInteraction, error: unknown) {
    Logger.error('播放歌曲時發生錯誤:', error)
    const embed = new EmbedBuilder().setColor('Red').setTitle('發生錯誤').setTimestamp()

    await interaction
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

function sanitizeSpotifyUrl(url: string): string {
    if (url.includes('spotify.com')) {
        return url.split('?')[0] ?? url
    }
    return url
}
