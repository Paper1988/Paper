import emojis from '@/libs/emoji/emoji.js'
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    InteractionResponse,
    Message,
    type MessageActionRowComponentBuilder
} from 'discord.js'

// 使用 DisTube 的原始類型
import type { Queue, Song } from 'distube'

// 常數提取
const PROGRESS_BAR_LENGTH = 22
const DEFAULT_DELETE_TIME = 15 * 1000
const VOLUME_MAX = 200
const VOLUME_MIN = 0

// 優化的時間轉換函數
const secondsToDuration = (seconds: string | number): string => {
    const totalSeconds = typeof seconds === 'string' ? parseInt(seconds, 10) : Math.floor(seconds)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60

    const pad = (num: number): string => num.toString().padStart(2, '0')

    if (hours > 0) {
        return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`
    }
    return `${pad(minutes)}:${pad(secs)}`
}

// 優化的按鈕生成函數
const generateMusicStatusButtons = (queue: Queue) => {
    const createButton = (customId: string, emoji: string, style: ButtonStyle, disabled = false) =>
        new ButtonBuilder()
            .setCustomId(customId)
            .setEmoji(emoji)
            .setStyle(style)
            .setDisabled(disabled)

    const row1 = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
        createButton(
            'autoplay',
            emojis.update,
            queue.autoplay ? ButtonStyle.Success : ButtonStyle.Secondary
        ),
        createButton(
            'previous',
            emojis.backforward,
            ButtonStyle.Secondary,
            queue.previousSongs.length === 0
        ),
        createButton(
            'togglePause',
            queue.paused ? emojis.play : emojis.pause,
            queue.paused ? ButtonStyle.Primary : ButtonStyle.Secondary
        ),
        createButton(
            'skip',
            emojis.frontforward,
            ButtonStyle.Secondary,
            queue.autoplay ? false : queue.songs.length === 1
        ),
        createButton('shuffle', emojis.shuffle, ButtonStyle.Secondary)
    ])

    const row2 = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
        createButton(
            'loop',
            emojis.loop2,
            queue.repeatMode ? ButtonStyle.Success : ButtonStyle.Secondary
        ),
        createButton(
            'volumeDown',
            emojis.speaker_low,
            ButtonStyle.Secondary,
            queue.volume <= VOLUME_MIN
        ),
        createButton('stop', emojis.stop, ButtonStyle.Danger),
        createButton('volumeUp', emojis.speaker, ButtonStyle.Secondary, queue.volume >= VOLUME_MAX),
        createButton('related', emojis.add, ButtonStyle.Secondary)
    ])

    const row3 = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
        createButton('queue', emojis.queue, ButtonStyle.Secondary),
        createButton('addSong', emojis.friend, ButtonStyle.Secondary),
        createButton('filters', emojis.spark, ButtonStyle.Secondary),
        createButton('lyrics', emojis.list, ButtonStyle.Secondary),
        createButton('playlist:save', emojis.download, ButtonStyle.Secondary)
    ])

    return [row1, row2, row3]
}

// 優化的進度條生成函數
const generateProgressBar = (
    length: number,
    totalLength: number,
    barLength: number = PROGRESS_BAR_LENGTH
): string => {
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

// 優化的播放器狀態更新函數
const updateMusicPlayerStatus = async (queue: Queue, completed?: boolean): Promise<void> => {
    if (!queue?.textChannel) return

    const musicControllerMsgId = (queue as any).musicControllerMsgId
    if (!musicControllerMsgId) return

    const msg = queue.textChannel.messages.cache.get(musicControllerMsgId)
    if (!msg) return

    const song = queue.songs[0]
    if (!song) {
        clearPlayer(queue)
        return
    }

    if (completed) resetPlayer(queue)
    await msg.edit(generateMusicPlayerStatus(queue, song, completed))
}

const clearPlayer = (queue: Queue): void => {
    resetPlayer(queue)
    if (queue.playerIntervalId) {
        clearInterval(queue.playerIntervalId)
    }
}

const resetPlayer = (queue: Queue): void => {
    ;(queue as any).musicControllerMsgId = null
}

// 優化的音樂播放器狀態生成函數
const generateMusicPlayerStatus = (queue: Queue, song: Song, completed = false) => {
    if (!song?.name || !queue) {
        console.error('Missing required properties:', { song: !!song, queue: !!queue })
        return {
            embeds: [
                new EmbedBuilder()
                    .setColor('Red')
                    .setDescription(`${emojis.outage} | 無法獲取歌曲資訊`)
            ],
            components: []
        }
    }

    const songDuration = song.duration || 0
    const isSpotify = song.source === 'spotify'
    const isLive = song.isLive || !songDuration

    // 進度顯示邏輯
    const getProgressDisplay = () => {
        if (isLive) return '🔴 直播中'
        if (completed) {
            const duration = secondsToDuration(songDuration)
            return `\`${duration}\` - \`${duration}\``
        }
        return `\`${secondsToDuration(queue.currentTime)}\` - \`${secondsToDuration(songDuration)}\``
    }

    // 重複播放模式文字
    const getRepeatModeText = () => {
        if (!queue.repeatMode) return emojis.xmark
        return queue.repeatMode === 2 ? '整個清單' : '單曲'
    }

    return {
        embeds: [
            new EmbedBuilder()
                .setColor(queue.paused ? 'Orange' : 'Green')
                .setDescription(
                    `${emojis.music} | [${song.name}](${song.url}) - \` ${secondsToDuration(songDuration)} \``
                )
                .setAuthor({
                    name: song.user?.displayName || '未知用戶',
                    iconURL: song.user?.displayAvatarURL() || undefined
                })
                .addFields(
                    {
                        name: `${emojis.speaker}音量`,
                        value: `\`${queue.volume}%\``,
                        inline: true
                    },
                    {
                        name: `${emojis.spark}過濾器`,
                        value:
                            queue.filters.names.length > 0
                                ? queue.filters.names.join(', ')
                                : emojis.xmark,
                        inline: true
                    },
                    {
                        name: `${emojis.loop1}重複播放`,
                        value: getRepeatModeText(),
                        inline: true
                    },
                    {
                        name: `${emojis.update}自動播放`,
                        value: queue.autoplay ? emojis.correct : emojis.xmark,
                        inline: true
                    },
                    {
                        name: `${emojis.clock}進度`,
                        value: getProgressDisplay(),
                        inline: true
                    },
                    {
                        name: `${emojis.playlist}播放清單`,
                        value: `\`${queue.songs.length} 首歌曲\``,
                        inline: true
                    },
                    {
                        name: `${emojis.people}作者`,
                        value: `\`${song.uploader.name || '無'}\``,
                        inline: true
                    },
                    {
                        name: `${emojis.views}觀看次數`,
                        value: `\`${song.views?.toLocaleString() || '無資料'}\``,
                        inline: true
                    },
                    {
                        name: `${emojis.likes}喜歡數`,
                        value: `\`${song.likes?.toLocaleString() || '無資料'}\``,
                        inline: true
                    },
                    {
                        name: '進度條',
                        value: completed
                            ? generateProgressBar(songDuration, songDuration)
                            : generateProgressBar(queue.currentTime, songDuration)
                    }
                )
                .setImage(isSpotify ? null : song.thumbnail || null)
                .setThumbnail(isSpotify ? song.thumbnail || null : null)
                .setTimestamp()
                .setFooter({
                    text: `在 ${queue.voiceChannel?.name || '未知'} 中播放`
                })
        ],
        components: completed ? [] : generateMusicStatusButtons(queue)
    }
}

const deleteMessageAfter = (
    msg: InteractionResponse | Message,
    time = DEFAULT_DELETE_TIME
): void => {
    setTimeout(() => msg.delete(), time)
}

export {
    clearPlayer,
    deleteMessageAfter,
    generateMusicPlayerStatus,
    generateMusicStatusButtons,
    generateProgressBar,
    resetPlayer,
    updateMusicPlayerStatus
}
