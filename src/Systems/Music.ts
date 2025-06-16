import emojis from '@/libs/emoji/emoji'
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    InteractionResponse,
    Message,
    type MessageActionRowComponentBuilder
} from 'discord.js'

type Queue = any
type Song = any

const secondsToDuration = (seconds: string) => {
    const secondsInNum = parseInt(seconds, 10)
    let hours: number | string = Math.floor(secondsInNum / 3600)
    let minutes: number | string = Math.floor((secondsInNum - hours * 3600) / 60)
    let _seconds: number | string = secondsInNum - hours * 3600 - minutes * 60

    if (hours && hours < 10) {
        hours = '0' + hours
    }
    if (minutes < 10) {
        minutes = '0' + minutes
    }
    if (_seconds < 10) {
        _seconds = '0' + _seconds
    }
    if (hours) {
        return `${hours}:${minutes}:${_seconds}`
    } else {
        return `${minutes}:${_seconds}`
    }
}

const generateMusicStatusButtons = (queue: Queue) => {
    const row1 = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
        new ButtonBuilder()
            .setCustomId('autoplay')
            .setEmoji('<:update:1265562455828987968>')
            .setStyle(queue.autoplay ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('previous')
            .setEmoji('<:backforward:1265557186621345833>')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(queue.previousSongs.length === 0),
        new ButtonBuilder()
            .setCustomId('togglePause')
            .setEmoji(queue.paused ? '<:play:1265561505458294826>' : '<:pause:1265561390358331462>')
            .setStyle(queue.paused ? ButtonStyle.Primary : ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('skip')
            .setEmoji('<:frontforward:1265560424510787584>')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(queue.autoplay ? false : queue.songs.length === 1),
        new ButtonBuilder()
            .setCustomId('shuffle')
            .setEmoji('<:shuffle:1265561846690222081>')
            .setStyle(ButtonStyle.Secondary)
    ])
    const row2 = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
        new ButtonBuilder()
            .setCustomId('loop')
            .setEmoji('<:loop2:1265560938417754213>')
            .setStyle(queue.repeatMode ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('volumeDown')
            .setEmoji('<:speaker_low:1265561976663310386>')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(queue.volume <= 0),
        new ButtonBuilder()
            .setCustomId('stop')
            .setEmoji('<:stop:1265562218498363422>')
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('volumeUp')
            .setEmoji('<:speaker:1265561928533807146>')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(queue.volume >= 200),
        new ButtonBuilder()
            .setCustomId('related')
            .setEmoji('<:add:1265556973202706503>')
            .setStyle(ButtonStyle.Secondary)
    ])
    const row3 = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
        new ButtonBuilder()
            .setCustomId('queue')
            .setEmoji('<:queue:1265561609632485478>')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('addSong')
            .setEmoji('<:friend:1265560408895524957>')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('filters')
            .setEmoji('<:spark:1265561903195750471>')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('lyrics')
            .setEmoji('<:list:1265560873876062340>')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('playlist:save')
            .setEmoji('<:download:1320298270739791973>')
            .setStyle(ButtonStyle.Secondary)
    ])

    return [row1, row2, row3]
}
const generateProgressBar = (length: number, totalLength: number, barLength: number = 22) => {
    let progress = Math.floor((length / totalLength) * barLength)
    progress = Math.min(progress, barLength)

    const leftEmpty = '<:leftempty:1320325939137351711>'
    const middleEmpty = '<:midempty:1320325989850415196>'
    const rightEmpty = '<:rightempty:1320325997203296276>'
    const leftFilled = '<:leftfull:1320326004631142412>'
    const middleFilled = '<:midfull:1320326013523329035>'
    const rightFilled = '<:rightfull:1320326021689638943>'

    let progressBar = ''

    if (progress === 0) {
        progressBar = leftEmpty + middleEmpty.repeat(barLength - 2) + rightEmpty
    } else if (progress === barLength) {
        progressBar = leftFilled + middleFilled.repeat(barLength - 2) + rightFilled
    } else {
        progressBar = leftFilled

        if (progress > 1) {
            progressBar += middleFilled.repeat(progress - 1)
        }

        if (progress < barLength - 1) {
            progressBar += middleEmpty.repeat(barLength - progress - 1)
        }

        progressBar += progress === barLength - 1 ? rightFilled : rightEmpty
    }

    return progressBar
}

const updateMusicPlayerStatus = async (queue: Queue, completed?: boolean) => {
    if (!queue?.textChannel) return

    if (!queue.musicControllerMsgId) return

    const msg = queue?.textChannel?.messages.cache.get(queue.musicControllerMsgId)
    if (!msg) return

    const song = queue.songs[0]
    if (!song) {
        clearPlayer(queue)
        return
    }

    if (completed) resetPlayer(queue)
    await msg.edit(generateMusicPlayerStatus(queue, song, completed))
}

const clearPlayer = (queue: Queue) => {
    resetPlayer(queue)
    clearInterval(queue.playerIntervalId)
}

const resetPlayer = (queue: Queue) => {
    queue.musicControllerMsgId = null
}

const generateMusicPlayerStatus = (queue: Queue, song: Song, completed: boolean = false) => {
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

    /* const previousSongsLength = queue.previousSongs.reduce((store, curr) => {
        const duration = curr.stream.playFromSource ? curr.duration : curr.stream.song.duration

        return store + duration
    }, 0)

    const queuePlayedLength =
        previousSongsLength + queue.currentTime + (completed ? songDuration : 0)
    const totalQueueLength = previousSongsLength + songDuration; */

    return {
        embeds: [
            new EmbedBuilder()
                .setColor(queue.paused ? 'Orange' : 'Green')
                .setDescription(
                    `<:music:1265561113039208512> | [${song.name}](${song.url}) - \` ${secondsToDuration(
                        songDuration
                    )} \``
                )
                .setAuthor({
                    name: `${song.user.displayName}`,
                    iconURL: song.user.displayAvatarURL()
                })
                .addFields(
                    {
                        name: '<:speaker:1265561928533807146>音量',
                        value: `\`${queue.volume}%\``,
                        inline: true
                    },
                    {
                        name: '<:spark:1265561903195750471>過濾器',
                        value: `${
                            queue.filters.names.length > 0
                                ? queue.filters.names.join(', ')
                                : '<:xmark:1265562550947545089>'
                        }`,
                        inline: true
                    },
                    {
                        name: '<:loop1:1265560917345570918>重複播放',
                        value: `${
                            queue.repeatMode
                                ? queue.repeatMode === 2
                                    ? '<:loop2:1265560938417754213>整個清單'
                                    : '<:looponce:1265560956193210399>單曲'
                                : '<:xmark:1265562550947545089>'
                        }`,
                        inline: true
                    },
                    {
                        name: '<:update:1265562455828987968>自動播放',
                        value: `${
                            queue.autoplay
                                ? '<:correct:1265560254708711467>'
                                : '<:xmark:1265562550947545089>'
                        }`,
                        inline: true
                    },
                    {
                        name: '<:clock:1265560238137016372>進度',
                        value: `${
                            song.isLive || !songDuration
                                ? '🔴 直播中'
                                : completed
                                  ? `\`${secondsToDuration(songDuration)}\` - \`${secondsToDuration(songDuration)}\``
                                  : `\`${secondsToDuration(queue.currentTime)}\` - \`${secondsToDuration(songDuration)}\``
                        }`,
                        inline: true
                    },
                    {
                        name: '<:playlist:1265561609632485478>播放清單',
                        value: `\`${queue.songs.length} 首歌曲\``,
                        inline: true
                    },
                    {
                        name: '<:people:1265561435220611196>作者',
                        value: `\`${song.uploader.name || '無'}\``,
                        inline: true
                    },
                    {
                        name: '<:views:1265561928533807146>觀看次數',
                        value: `\`${song.views?.toLocaleString() || '無資料'}\``,
                        inline: true
                    },
                    {
                        name: '<:likes:1265561903195750471>喜歡數',
                        value: `\`${song.likes?.toLocaleString() || '無資料'}\``,
                        inline: true
                    },
                    {
                        name: '進度條',
                        value: `${
                            completed
                                ? `${generateProgressBar(songDuration, songDuration, 22)}`
                                : `${generateProgressBar(queue.currentTime, songDuration, 22)}`
                        }`
                    }
                )
                .setImage(song.thumbnail)
                .setTimestamp()
                .setFooter({
                    text: `在 ${queue.voiceChannel.name || '未知'} 中播放`
                })
        ],
        components: completed ? [] : generateMusicStatusButtons(queue)
    }
}

const deleteMessageAfter = (msg: InteractionResponse | Message, time: number = 15 * 1000) => {
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
