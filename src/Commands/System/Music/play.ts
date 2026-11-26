import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { deleteMessageAfter, validateVoiceChannel } from '@/Systems/Music.js'
import type { MusicManager } from '@/Systems/Music/MusicManager.js'
import type { MusicPlayerSnapshot } from '@/Systems/Music/types.js'
import emojis from '@/libs/emoji/emoji.js'
import { Logger } from '@/libs/utils/logger.js'
import { cacheDel, cacheGetJson } from '@/libs/utils/redis.js'
import type { SubCommandType } from '@/typings/command.js'
import { ChatInputCommandInteraction, EmbedBuilder, GuildMember } from 'discord.js'

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
        const voiceChannel = member.voice.channel

        const skip = options.getBoolean('skip', false)
        const search = options.getString('search')!

        await interaction.reply({
            content: `${emojis.discord_loading} | 處理請求中...`
        })

        if (!(await validateVoiceChannel(interaction, client, voiceChannel))) return

        try {
            const music = client.musicManager
            if (!music) throw new Error('Music manager is not initialized')

            const player = await getOrCreatePlayer(
                music,
                guild!.id,
                voiceChannel!.id,
                channel!.id
            )

            const actualSearchValue = await resolveSearchQuery(interaction, search)
            if (!actualSearchValue) return

            const result = await music.search({
                query: actualSearchValue,
                requesterId: interaction.user.id
            })

            if (!(await validateSearchResult(interaction, result))) return

            await addTracksToQueue(music, guild!.id, result)
            await handlePlayback(music, player, skip)

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
    music: MusicManager,
    guildId: string,
    voiceChannelId: string,
    textChannelId: string
): Promise<MusicPlayerSnapshot> {
    let player = await music.getPlayer(guildId)

    if (!player) {
        await music.createPlayer({
            guildId,
            voiceChannelId,
            textChannelId
        })
        player = await music.getPlayer(guildId)
    }

    if (!player) throw new Error(`Failed to create music player for guild ${guildId}`)

    if (!player.connected) {
        await music.connect(guildId, true)
        player = await music.getPlayer(guildId)
    }

    if (!player) throw new Error(`Music player disappeared for guild ${guildId}`)
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
    result: Awaited<ReturnType<MusicManager['search']>>
): Promise<boolean> {
    if (result.loadType === 'empty' || result.tracks.length === 0) {
        await interaction
            .editReply({ content: `${emojis.warning} | 找不到相關的歌曲` })
            .then(deleteMessageAfter)
        return false
    }

    if (result.loadType === 'error' || result.error) {
        Logger.error('搜尋發生錯誤:', result.error?.message ?? 'Unknown error')
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
async function addTracksToQueue(
    music: MusicManager,
    guildId: string,
    result: Awaited<ReturnType<MusicManager['search']>>
): Promise<void> {
    const tracks =
        result.loadType === 'playlist' ? result.tracks : result.tracks.slice(0, 1)

    if (tracks.length > 0) await music.enqueue(guildId, tracks)
}

/**
 * 處理播放與跳過邏輯
 */
async function handlePlayback(
    music: MusicManager,
    player: MusicPlayerSnapshot,
    skip: boolean | null
): Promise<void> {
    if (skip && player.currentTrack) {
        await music.skip(player.guildId)
    } else if (!player.playing && !player.paused) {
        await music.play(player.guildId)
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
