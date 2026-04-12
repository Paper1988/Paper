import MusicDB from '@/Structures/Schemas/MusicDB.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import emojis from '@/libs/emoji/emoji.js'
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    Guild,
    InteractionResponse,
    Message,
    TextChannel,
    VoiceChannel,
    type MessageActionRowComponentBuilder
} from 'discord.js'
import { Player, Track } from 'moonlink.js'

// ==================== Constants ====================

const PROGRESS_BAR_LENGTH = 22
const DEFAULT_DELETE_TIME = 15 * 1000
const VOLUME_MAX = 100
const VOLUME_MIN = 0

// ==================== Utility Functions ====================

/**
 * 計算進度條更新間隔
 * 直播：每分鐘更新；普通歌曲：每 10 秒更新
 */
const getInterval = (track: Track): number => {
    if (track.isStream) return 60 * 1000
    return 10 * 1000
}

export class MusicService {
    // ==================== Time Formatting ====================

    /**
     * 將毫秒轉換為 HH:MM:SS 或 MM:SS 字串
     */
    static millisToDuration(millis: number): string {
        const totalSeconds = Math.floor(millis / 1000)
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const secs = totalSeconds % 60

        const pad = (num: number): string => num.toString().padStart(2, '0')

        if (hours > 0) {
            return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`
        }
        return `${pad(minutes)}:${pad(secs)}`
    }

    /**
     * 將秒數（字串或數字）轉換為時長字串
     */
    static secondsToDuration(seconds: string | number): string {
        const totalSeconds =
            typeof seconds === 'string' ? parseInt(seconds, 10) : Math.floor(seconds)
        return MusicService.millisToDuration(totalSeconds * 1000)
    }

    // ==================== UI Builders ====================

    /**
     * 生成音樂播放器的按鈕列
     */
    static generateMusicStatusButtons(player: Player) {
        const createButton = (
            customId: string,
            emoji: string,
            style: ButtonStyle,
            disabled = false
        ) =>
            new ButtonBuilder()
                .setCustomId(customId)
                .setEmoji(emoji)
                .setStyle(style)
                .setDisabled(disabled)

        const row1 = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
            createButton(
                'autoplay',
                emojis.update,
                player.autoPlay ? ButtonStyle.Success : ButtonStyle.Secondary
            ),
            createButton(
                'previous',
                emojis.backforward,
                ButtonStyle.Secondary,
                player.previous.length === 0
            ),
            createButton(
                'togglePause',
                player.paused ? emojis.play : emojis.pause,
                player.paused ? ButtonStyle.Primary : ButtonStyle.Secondary
            ),
            createButton(
                'skip',
                emojis.frontforward,
                ButtonStyle.Secondary,
                player.autoPlay ? false : player.queue.tracks.length <= 1
            ),
            createButton('shuffle', emojis.shuffle, ButtonStyle.Secondary)
        ])

        const row2 = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
            createButton(
                'loop',
                emojis.loop2,
                player.loop !== 'off' ? ButtonStyle.Success : ButtonStyle.Secondary
            ),
            createButton(
                'volumeDown',
                emojis.speaker_low,
                ButtonStyle.Secondary,
                player.volume <= VOLUME_MIN
            ),
            createButton('stop', emojis.stop, ButtonStyle.Danger),
            createButton(
                'volumeUp',
                emojis.speaker,
                ButtonStyle.Secondary,
                player.volume >= VOLUME_MAX
            ),
            createButton('related', emojis.add, ButtonStyle.Secondary)
        ])

        const row3 = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
            createButton('queue', emojis.queue, ButtonStyle.Secondary),
            createButton('addSong', emojis.friend, ButtonStyle.Secondary),
            createButton('lyrics', emojis.list, ButtonStyle.Secondary),
            createButton('playlist:save', emojis.download, ButtonStyle.Secondary)
        ])

        return [row1, row2, row3]
    }

    /**
     * 生成進度條字串
     */
    static generateProgressBar(
        length: number,
        totalLength: number,
        barLength: number = PROGRESS_BAR_LENGTH
    ): string {
        if (totalLength <= 0)
            return emojis.leftempty + emojis.midempty.repeat(barLength - 2) + emojis.rightempty

        const progress = Math.min(Math.floor((length / totalLength) * barLength), barLength)

        if (progress === 0) {
            return emojis.leftempty + emojis.midempty.repeat(barLength - 2) + emojis.rightempty
        }

        if (progress === barLength) {
            return emojis.leftfull + emojis.midfull.repeat(barLength - 2) + emojis.rightfull
        }

        const filledPart = progress > 1 ? emojis.midfull.repeat(progress - 1) : ''
        const emptyPart =
            progress < barLength - 1 ? emojis.midempty.repeat(barLength - progress - 1) : ''
        const rightPart = progress === barLength - 1 ? emojis.rightfull : emojis.rightempty

        return emojis.leftfull + filledPart + emptyPart + rightPart
    }

    /**
     * 生成音樂播放器嵌入訊息的完整 payload（embed + components）
     */
    static generateMusicPlayerStatus(
        player: Player,
        client: PaperClient,
        track: Track,
        completed = false
    ) {
        if (!track?.title || !player) {
            console.error('Missing required properties:', { track: !!track, player: !!player })
            return {
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(`${emojis.outage} | 無法獲取歌曲資訊`)
                ]
            }
        }

        const songDuration = track.duration || 0
        const currentPosition = completed ? songDuration : track.position
        const isLive = track.isStream || !songDuration

        const getProgressDisplay = () => {
            if (isLive) return '🔴 直播中'
            return `\`${MusicService.millisToDuration(currentPosition)}\` - \`${MusicService.millisToDuration(songDuration)}\``
        }

        const getRepeatModeText = () => {
            if (player.loop === 'off') return emojis.xmark
            return player.loop === 'queue' ? '整個佇列' : '單曲'
        }

        const barLength = track.sourceName === 'spotify' ? 21 : PROGRESS_BAR_LENGTH
        const progressBar = isLive
            ? `🔴 ${'━'.repeat(barLength)} 直播中`
            : MusicService.generateProgressBar(currentPosition, songDuration, barLength)

        const voiceChannel = client.channels.cache.get(player.voiceChannelId) as
            | VoiceChannel
            | undefined

        return {
            embeds: [
                new EmbedBuilder()
                    .setColor(player.paused ? 'Orange' : 'Green')
                    .setDescription(
                        `${emojis.music} | [${track.title}](${track.uri}) - \` ${MusicService.millisToDuration(songDuration)} \``
                    )
                    .setAuthor({
                        name: client.users.cache.get(track.requester)?.username ?? '未知用戶',
                        iconURL:
                            client.users.cache.get(track.requester)?.displayAvatarURL() ??
                            undefined
                    })
                    .addFields(
                        {
                            name: `${emojis.speaker}音量`,
                            value: `\`${player.volume}%\``,
                            inline: true
                        },
                        {
                            name: `${emojis.loop1}重複播放`,
                            value: getRepeatModeText(),
                            inline: true
                        },
                        {
                            name: `${emojis.update}自動播放`,
                            value: player.autoPlay ? emojis.correct : emojis.xmark,
                            inline: true
                        },
                        {
                            name: `${emojis.clock}進度`,
                            value: getProgressDisplay(),
                            inline: true
                        },
                        {
                            name: `${emojis.people}作者`,
                            value: `\`${track.author || '無'}\``,
                            inline: true
                        },
                        {
                            name: `${emojis.playlist}播放清單`,
                            value: `\`${player.queue.tracks.length + 1} 首歌曲\``,
                            inline: true
                        },
                        {
                            name: '進度條',
                            value: progressBar
                        }
                    )
                    .setImage(track.sourceName === 'youtube' ? track.thumbnail : null)
                    .setThumbnail(track.sourceName === 'spotify' ? track.thumbnail : null)
                    .setTimestamp()
                    .setFooter({
                        text: `在 ${voiceChannel?.name ?? '未知頻道'} 中播放`
                    })
            ],
            components: completed ? [] : MusicService.generateMusicStatusButtons(player)
        }
    }

    // ==================== Player Lifecycle ====================

    /**
     * 清除播放器狀態並停止進度條 interval
     */
    static clearPlayer(player: Player): void {
        MusicService.resetPlayer(player)
        const intervalId = player.data.playerIntervalId as NodeJS.Timeout
        if (intervalId) {
            clearInterval(intervalId)
        }
    }

    /**
     * 重置播放器的訊息 ID 記錄
     */
    static resetPlayer(player: Player): void {
        player.set('musicControllerMsgId', undefined)
    }

    /**
     * 啟動進度條自動更新 interval
     */
    static startProgressUpdater(player: Player, client: PaperClient): void {
        // 清除舊的 interval（如果存在）
        if (player.data.playerIntervalId) {
            clearInterval(player.data.playerIntervalId as NodeJS.Timeout)
        }

        if (!player.current) return

        player.set(
            'playerIntervalId',
            setInterval(
                () => {
                    if (!player.playing || player.paused) return
                    MusicService.updateMusicPlayerStatus(player, client).catch(console.error)
                },
                getInterval(player.current ?? ({ isStream: false } as Track))
            )
        )
    }

    /**
     * 停止進度條更新 interval
     */
    static stopProgressUpdater(player: Player): void {
        if (player.data.playerIntervalId) {
            clearInterval(player.data.playerIntervalId as NodeJS.Timeout)
            player.set('playerIntervalId', undefined)
        }
    }

    /**
     * 更新音樂播放器控制訊息至最新狀態
     */
    static async updateMusicPlayerStatus(
        player: Player,
        client: PaperClient,
        completed?: boolean
    ): Promise<void> {
        if (!player.textChannelId) return

        const musicControllerMsgId = player.data.musicControllerMsgId as string
        if (!musicControllerMsgId) return

        const msg = (
            client.channels.cache.get(player.textChannelId) as TextChannel
        ).messages.cache.get(musicControllerMsgId)

        if (!msg) {
            player.set('musicControllerMsgId', undefined)
            return
        }

        const track = player.current
        if (!track) {
            MusicService.clearPlayer(player)
            return
        }

        if (completed) MusicService.resetPlayer(player)
        await msg.edit(MusicService.generateMusicPlayerStatus(player, client, track, completed))
    }

    // ==================== Database Operations ====================

    /**
     * 從資料庫讀取伺服器的音樂設定
     * 若無記錄則回傳預設值
     */
    static async fetchGuildSettings(guild: Guild | string): Promise<{
        volume: number
        repeatMode: 'off' | 'track' | 'queue'
        autoplay: boolean
    }> {
        const db = await MusicDB.findOne({
            GuildID: typeof guild === 'string' ? guild : guild.id
        })

        let repeatMode: 'off' | 'track' | 'queue' = 'off'

        if (!db) return { volume: 50, repeatMode, autoplay: false }

        switch (db.repeatMode) {
            case 1:
                repeatMode = 'track'
                break
            case 2:
                repeatMode = 'queue'
                break
            default:
                repeatMode = 'off'
        }

        return {
            volume: db.volume,
            repeatMode,
            autoplay: db.autoplay
        }
    }

    // ==================== Validation ====================

    /**
     * 檢查語音頻道的相關條件，若未通過則自動回覆錯誤訊息
     */
    static async validateVoiceChannel(
        interaction: ChatInputCommandInteraction | ButtonInteraction,
        client: PaperClient,
        voiceChannel: VoiceChannel | null | undefined
    ): Promise<boolean> {
        if (!voiceChannel) {
            await interaction
                .editReply({
                    content: `${emojis.warning} | 你必須待在語音頻道裡面才能使用音樂指令!`
                })
                .then(deleteMessageAfter)
            return false
        }

        const currentPlayer = client.moonlink?.players.get(interaction.guildId!) as Player
        if (currentPlayer?.voiceChannelId && voiceChannel.id !== currentPlayer.voiceChannelId) {
            await interaction
                .editReply({
                    content: `${emojis.warning} | 我已經在語音頻道 - <#${currentPlayer.voiceChannelId}> 裡播放音樂了`
                })
                .then(deleteMessageAfter)
            return false
        }

        if (!voiceChannel.joinable) {
            await interaction
                .editReply({
                    content: '',
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('拒絕請求')
                            .setDescription(
                                `${emojis.warning} | 我沒有權限進入 <#${voiceChannel.id}>!`
                            )
                            .setColor('Red')
                    ]
                })
                .then(deleteMessageAfter)
            return false
        }

        return true
    }
}

// ==================== Standalone Utilities ====================

/**
 * 在指定時間後自動刪除訊息
 * 此為通用工具函數，不限於音樂功能
 */
export const deleteMessageAfter = (
    msg: InteractionResponse | Message,
    time = DEFAULT_DELETE_TIME
): void => {
    if (!msg) return
    setTimeout(() => {
        msg.delete().catch(() => {})
    }, time)
}

export default MusicService
