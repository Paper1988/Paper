import DB from '@/Structures/Schemas/MusicDB.js'
import {
    clearPlayer,
    deleteMessageAfter,
    generateMusicPlayerStatus,
    updateMusicPlayerStatus
} from '@/Systems/Music.js'
import { PaperClient } from '@/classes/PaperClient.js'
import emojis from '@/libs/emoji/emoji.js'
import { EmbedBuilder, Message } from 'discord.js'
import { DisTubeError, Events, Playlist, Queue, RepeatMode, Song } from 'distube'

// 使用環境變數或從配置文件載入
const DEBUG_WEBHOOK_ID = process.env.DEBUG_WEBHOOK_ID || '1344304470615654430'
const DEBUG_WEBHOOK_TOKEN =
    process.env.DEBUG_WEBHOOK_TOKEN ||
    'dEoxkelcoU5IUgTO6cK1THh5yGVyzy26pu_mc48B1yPH8bYySpmn0U7v-RN0_qx215Lk'

declare module 'distube' {
    interface Queue {
        musicControllerMsgId: string
        playerIntervalId: NodeJS.Timeout
    }
}

/**
 * 發送隊列訊息的統一函數
 */
async function sendQueueMessage(
    queue: Queue,
    content: string,
    color = '#00ff00',
    deleteAfterMs = 15000,
    title?: string
) {
    if (!queue?.textChannel) return Promise.resolve(null)

    const embed = new EmbedBuilder().setColor(color as `#${string}`).setDescription(content)

    if (title) {
        embed.setTitle(title)
    }

    try {
        const msg = await queue.textChannel.send({ embeds: [embed] })
        deleteMessageAfter(msg, deleteAfterMs)
        return msg
    } catch (err) {
        console.error('發送隊列訊息時發生錯誤:', err)
        return null
    }
}

/**
 * 統一的音樂錯誤處理
 */
function handleMusicError(error: any, queue?: Queue, context = '音樂播放時發生錯誤') {
    console.error(`${context}:`, error)

    if (queue?.textChannel) {
        sendQueueMessage(queue, `${emojis.outage} | ${context}，請協助回報！`, 'Red')
    }
}

/**
 * 分類音樂錯誤並返回適當的錯誤訊息
 */
function classifyMusicError(error: any, song?: Song) {
    // Spotify + SoundCloud 特殊情況
    if (
        error instanceof DisTubeError &&
        error.errorCode === 'SOUNDCLOUD_PLUGIN_NO_RESULT' &&
        song?.source === 'spotify'
    ) {
        return {
            title: '找不到歌曲',
            message:
                `無法在 SoundCloud 上找到歌曲：**${song.name}**\n` +
                '這首歌是從 Spotify 取得的資訊，但在 SoundCloud 上找不到對應的歌曲。\n' +
                '建議：\n' +
                '1. 嘗試使用歌曲名稱直接搜尋\n' +
                '2. 使用其他音樂平台的連結',
            footer: '試試直接搜尋歌名'
        }
    }

    // 網路錯誤
    if (error.message && error.message.includes('network')) {
        return {
            title: '網路連線錯誤',
            message: '連接音樂服務時發生網路問題，請稍後再試。',
            footer: '如果問題持續發生，請檢查機器人的網絡連接'
        }
    }

    // 其他錯誤
    return {
        title: '播放錯誤',
        message: error.toString().slice(0, 1974),
        footer: '請使用 /feedback 協助回報!'
    }
}

// 事件處理函數
const eventHandlers = {
    /**
     * 播放歌曲事件
     */
    playSong: async (queue: Queue, song: Song) => {
        try {
            if (!song || !queue) return

            const status = generateMusicPlayerStatus(queue, song)
            if (queue.textChannel) {
                const msg = await queue.textChannel.send(status)
                queue.musicControllerMsgId = msg.id
            }
        } catch (error) {
            handleMusicError(error, queue, '播放歌曲時發生錯誤')
        }
    },

    /**
     * 添加歌曲事件
     */
    addSong: (queue: Queue, song: Song) => {
        try {
            const { embeds } = generateMusicPlayerStatus(queue, song)
            embeds[0]!.data.fields = undefined

            sendQueueMessage(
                queue,
                `${emojis.plus} | 加入 [${song.name}](${song.url}) - \`${song.formattedDuration}\` 到清單中`,
                'Green'
            )
        } catch (error) {
            handleMusicError(error, queue, '添加歌曲時發生錯誤')
        }
    },

    /**
     * 添加播放列表事件
     */
    addList: (queue: Queue, playlist: Playlist) => {
        try {
            if (!playlist.songs[0]) return
            const { embeds } = generateMusicPlayerStatus(queue, playlist.songs[0])
            embeds[0]!.data.fields = undefined

            const name = playlist.url
                ? `[${playlist.name}](${playlist.url})`
                : `**${playlist.name}**`

            sendQueueMessage(
                queue,
                `${emojis.plus} | 加入 ${name} 播放清單 (\`${playlist.songs.length}\`首歌) 到清單中`,
                'Green'
            )
        } catch (error) {
            handleMusicError(error, queue, '添加播放列表時發生錯誤')
        }
    },

    /**
     * 錯誤事件處理
     */
    error: async (error: any, queue: Queue, song: Song | undefined) => {
        try {
            await updateMusicPlayerStatus(queue, true)
            clearPlayer(queue)

            const errorInfo = classifyMusicError(error, song)

            if (queue?.textChannel) {
                await queue.textChannel
                    .send({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Red')
                                .setTitle(`${emojis.outage} | ${errorInfo.title}`)
                                .setDescription(`\`\`\`${errorInfo.message}\`\`\``)
                                .setFooter({ text: errorInfo.footer })
                        ]
                    })
                    .then((msg: Message) => deleteMessageAfter(msg, 30 * 1000))
            }
        } catch (finalError) {
            console.error('處理錯誤事件時發生錯誤:', finalError)
        }
    },

    /**
     * 播放完成事件
     */
    finish: (queue: Queue) => {
        try {
            clearPlayer(queue)
            sendQueueMessage(queue, `${emojis.musicstop} | 清單播放完畢！`, 'Red')
        } catch (error) {
            handleMusicError(error, queue, '處理播放完成時發生錯誤')
        }
    },

    /**
     * 初始化隊列事件
     */
    initQueue: async (queue: Queue) => {
        try {
            clearPlayer(queue)

            // 使用 findOneAndUpdate 優化資料庫操作
            const data = await DB.findOneAndUpdate(
                { GuildID: queue.id },
                {
                    $setOnInsert: {
                        GuildID: queue.id,
                        volume: queue.volume,
                        autoplay: queue.autoplay,
                        repeatMode: queue.repeatMode
                    }
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            )

            // 設定值
            Object.assign(queue, {
                autoplay: data.autoplay,
                volume: data.volume,
                repeatMode: data.repeatMode,
                paused: false,
                musicControllerMsgId: ''
            })

            // 設定狀態更新定時器
            queue.playerIntervalId = setInterval(() => updateMusicPlayerStatus(queue), 5 * 1000)
        } catch (error) {
            handleMusicError(error, queue, '初始化隊列時發生錯誤')
        }
    },

    /**
     * 刪除隊列事件
     */
    deleteQueue: (queue: Queue) => {
        try {
            clearPlayer(queue)

            // 清除任何可能的記憶體洩漏
            if (queue.playerIntervalId) {
                clearInterval(queue.playerIntervalId)
            }
        } catch (error) {
            handleMusicError(error, queue, '刪除隊列時發生錯誤')
        }
    },

    /**
     * 歌曲結束事件
     */
    finishSong: async (queue: Queue) => {
        try {
            if (queue.repeatMode === RepeatMode.DISABLED) {
                // 無循環模式：清除播放器狀態
                await updateMusicPlayerStatus(queue, true)
            } else if (queue.repeatMode === RepeatMode.SONG) {
                // 單曲循環：保持播放器狀態
                await updateMusicPlayerStatus(queue, false)
            } else if (queue.repeatMode === RepeatMode.QUEUE) {
                // 佇列循環模式
                if (queue.songs.length === 1) {
                    // 佇列中只有一首歌：保持播放器狀態（因為會循環播放同一首）
                    await updateMusicPlayerStatus(queue, false)
                } else {
                    // 佇列中有多首歌：清除播放器狀態（下一首歌會自動播放）
                    await updateMusicPlayerStatus(queue, true)
                }
            } else if (!queue.songs[1] && !queue.autoplay) {
                // 沒有下一首歌且沒有自動播放：清除播放器狀態
                await updateMusicPlayerStatus(queue, true)
            }
            return
        } catch (error) {
            handleMusicError(error, queue, '處理歌曲結束時發生錯誤')
            clearPlayer(queue)
        }
    },

    /**
     * 找不到相關歌曲事件
     */
    noRelated: (queue: Queue) => {
        sendQueueMessage(queue, `${emojis.warning} | 找不到任何相關歌曲!`, 'Yellow')
    },

    /**
     * Debug 事件
     */
    debug: async (client: PaperClient, msg: string) => {
        try {
            const webhook = await client.fetchWebhook(DEBUG_WEBHOOK_ID, DEBUG_WEBHOOK_TOKEN)
            await webhook.send({
                embeds: [new EmbedBuilder().setDescription(`\`\`\`\n${msg}\n\`\`\``)]
            })
        } catch (error) {
            console.error('發送調試消息時發生錯誤:', error)
        }
    },

    /**
     * FFMPEG Debug 事件
     */
    ffmpegDebug: (msg: string) => {
        // 避免過度記錄
        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev') {
            console.log('[FFMPEG]', msg)
        }
    },

    /**
     * 斷線事件
     */
    disconnect: (queue: Queue) => {
        clearPlayer(queue)
        sendQueueMessage(queue, `${emojis.outage} | 與語音頻道的連接已中斷!`, 'Red')
    }
}

/**
 * 註冊 DisTube 事件
 * 這個函數應該在 Bot ready 時被呼叫
 */
export function registerDistubeEvents(client: PaperClient): void {
    console.log('註冊 DisTube 事件處理器...')

    client.distube
        .on(Events.PLAY_SONG, eventHandlers.playSong)
        .on(Events.ADD_SONG, eventHandlers.addSong)
        .on(Events.ADD_LIST, eventHandlers.addList)
        .on(Events.ERROR, eventHandlers.error)
        .on(Events.FINISH, eventHandlers.finish)
        .on(Events.INIT_QUEUE, eventHandlers.initQueue)
        .on(Events.DELETE_QUEUE, eventHandlers.deleteQueue)
        .on(Events.FINISH_SONG, eventHandlers.finishSong)
        .on(Events.NO_RELATED, eventHandlers.noRelated)
        .on(Events.DEBUG, (msg) => eventHandlers.debug(client, msg))
        .on(Events.FFMPEG_DEBUG, eventHandlers.ffmpegDebug)
        .on(Events.DISCONNECT, eventHandlers.disconnect)

    console.log('DisTube 事件處理器註冊完成')
}
