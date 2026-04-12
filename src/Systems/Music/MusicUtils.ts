import emojis from '@/libs/emoji/emoji.js'
import { Logger } from '@/libs/utils/logger.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { EmbedBuilder, InteractionResponse, Message } from 'discord.js'
import { Player, Track } from 'moonlink.js'

// ==================== Constants ====================

export const PROGRESS_BAR_LENGTH = 22
export const DEFAULT_DELETE_TIME = 15 * 1000
export const VOLUME_MAX = 100
export const VOLUME_MIN = 0

// ==================== Internal Helpers ====================

/**
 * 計算進度條更新間隔
 * 直播：每分鐘更新；普通歌曲：每 10 秒更新
 */
export const getInterval = (track: Track): number => {
    if (track.isStream) return 60 * 1000
    return 10 * 1000
}

// ==================== MusicUtils ====================

export class MusicUtils {
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
        return MusicUtils.millisToDuration(totalSeconds * 1000)
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
     * 發送隊列訊息的統一函數
     */
    static sendQueueMessage(
        player: Player,
        client: PaperClient,
        content: string,
        color = '#00ff00',
        title?: string
    ) {
        const channel = client.channels.cache.get(player.textChannelId)
        if (!channel) return Promise.resolve(null)

        const embed = new EmbedBuilder().setColor(color as `#${string}`).setDescription(content)

        if (title) embed.setTitle(title)

        try {
            if (channel.isTextBased() && 'send' in channel) {
                return channel.send({ embeds: [embed] }).then(deleteMessageAfter)
            }
        } catch (err) {
            Logger.error('發送隊列訊息時發生錯誤:', err)
            return null
        }
    }

    /**
     * 統一的音樂錯誤處理
     */
    static handleMusicError(
        error: any,
        client: PaperClient,
        player?: Player,
        context = '音樂播放時發生錯誤'
    ) {
        Logger.error(`${context}:`, error.message)

        const channelId = player?.textChannelId
        const channel = channelId ? client.channels.cache.get(channelId) : null

        if (channel && player) {
            MusicUtils.sendQueueMessage(
                player,
                client,
                `${emojis.outage} | ${context}，請協助回報！`,
                'Red'
            )?.catch(console.error)
        }
    }
}

/**
 * 在指定時間後自動刪除訊息
 * 此為通用工具函數，不限於音樂功能，亦被其他模組使用
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

export default MusicUtils
