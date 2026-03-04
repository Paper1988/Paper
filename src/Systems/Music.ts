import MusicDB from '@/Structures/Schemas/MusicDB.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import emojis from '@/libs/emoji/emoji.js'
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    Guild,
    InteractionResponse,
    Message,
    TextChannel,
    VoiceChannel,
    type MessageActionRowComponentBuilder
} from 'discord.js'
import { Player, Track } from 'moonlink.js'

const PROGRESS_BAR_LENGTH = 22
const DEFAULT_DELETE_TIME = 15 * 1000
const VOLUME_MAX = 100
const VOLUME_MIN = 0

const getInterval = (track: Track) => {
    if (track.isStream) return 60 * 1000 // 直播每分鐘更新一次狀態就好
    return 10 * 1000 // 普通歌曲 10 秒
}

const millisToDuration = (millis: number): string => {
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

const secondsToDuration = (seconds: string | number): string => {
    const totalSeconds = typeof seconds === 'string' ? parseInt(seconds, 10) : Math.floor(seconds)
    return millisToDuration(totalSeconds * 1000)
}

const generateMusicStatusButtons = (player: Player) => {
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

const updateMusicPlayerStatus = async (
    player: Player,
    client: PaperClient,
    completed?: boolean
): Promise<void> => {
    if (!player.textChannelId) return

    const musicControllerMsgId = player.data.musicControllerMsgId as string
    if (!musicControllerMsgId) return

    const msg = (client.channels.cache.get(player.textChannelId) as TextChannel).messages.cache.get(
        musicControllerMsgId
    )
    if (!msg) {
        player.set('musicControllerMsgId', undefined)
        return
    }

    const track = player.current
    if (!track) {
        clearPlayer(player)
        return
    }

    if (completed) resetPlayer(player)
    await msg.edit(generateMusicPlayerStatus(player, client, track, completed))
}

const clearPlayer = (player: Player): void => {
    resetPlayer(player)
    const intervalId = player.data.playerIntervalId as NodeJS.Timeout
    if (intervalId) {
        clearInterval(intervalId)
    }
}

const resetPlayer = (player: Player): void => {
    player.set('musicControllerMsgId', undefined)
}

// 啟動進度條自動更新
const startProgressUpdater = (player: Player, client: PaperClient): void => {
    // 清除舊的 interval (如果存在)
    if (player.data.playerIntervalId) {
        clearInterval(player.data.playerIntervalId as NodeJS.Timeout)
    }

    if (!player.current) return

    // 設置新的 interval
    player.set(
        'playerIntervalId',
        setInterval(
            () => {
                if (!player.playing || player.paused) {
                    return
                }
                updateMusicPlayerStatus(player, client).catch(console.error)
            },
            getInterval(player.current ?? ({ isStream: false } as Track))
        )
    )
}

// 停止進度條更新
const stopProgressUpdater = (player: Player): void => {
    if (player.data.playerIntervalId) {
        clearInterval(player.data.playerIntervalId as NodeJS.Timeout)
        player.set('playerIntervalId', undefined)
    }
}

// 音樂播放器狀態
const generateMusicPlayerStatus = (
    player: Player,
    client: PaperClient,
    track: Track,
    completed = false
) => {
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
        if (completed) {
            const duration = millisToDuration(songDuration)
            return `\`${duration}\` - \`${duration}\``
        }
        return `\`${millisToDuration(currentPosition)}\` - \`${millisToDuration(songDuration)}\``
    }

    const getRepeatModeText = () => {
        if (player.loop === 'off') return emojis.xmark
        return player.loop === 'queue' ? '整個清單' : '單曲'
    }

    const progressBar = isLive
        ? '🔴 ━━━━━━━━━━━━━━━━━━━━━━ 直播中'
        : generateProgressBar(currentPosition, songDuration)

    const voiceChannel = client.channels.cache.get(player.voiceChannelId) as
        | VoiceChannel
        | undefined

    return {
        embeds: [
            new EmbedBuilder()
                .setColor(player.paused ? 'Orange' : 'Green')
                .setDescription(
                    `${emojis.music} | [${track.title}](${track.uri}) - \` ${millisToDuration(songDuration)} \``
                )
                .setAuthor({
                    name: client.users.cache.get(track.requester)?.username ?? '未知用戶',
                    iconURL:
                        client.users.cache.get(track.requester)?.displayAvatarURL() ?? undefined
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
        components: completed ? [] : generateMusicStatusButtons(player)
    }
}

const deleteMessageAfter = (
    msg: InteractionResponse | Message,
    time = DEFAULT_DELETE_TIME
): void => {
    if (!msg) return
    setTimeout(() => msg.delete(), time)
}

async function MusicDbFetch(guild: Guild) {
    const db = await MusicDB.findOne({ GuildID: guild.id })

    let repeatMode: Player['loop'] = 'off'

    switch (db?.repeatMode) {
        case 0:
            repeatMode = 'off'
            break
        case 1:
            repeatMode = 'track'
            break
        case 2:
            repeatMode = 'queue'
    }

    return {
        volume: db?.volume,
        repeatMode: repeatMode,
        autoplay: db?.autoplay
    }
}

export {
    clearPlayer,
    deleteMessageAfter,
    generateMusicPlayerStatus,
    generateMusicStatusButtons,
    generateProgressBar,
    millisToDuration,
    MusicDbFetch,
    resetPlayer,
    secondsToDuration,
    startProgressUpdater,
    stopProgressUpdater,
    updateMusicPlayerStatus
}
