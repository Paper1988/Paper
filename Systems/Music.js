const { EmbedBuilder } = require('discord.js')
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const { Queue, Song } = require('distube')
const { emojis } = require('../libs/emoji/emoji')

const secondsToDuration = (seconds) => {
    const secondsInNum = parseInt(seconds, 10) // don't forget the second param
    let hours = Math.floor(secondsInNum / 3600)
    let minutes = Math.floor((secondsInNum - hours * 3600) / 60)
    let _seconds = secondsInNum - hours * 3600 - minutes * 60

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

/**
 *
 * @param {Queue} queue
 * @returns
 */
const generateMusicStatusButtons = (queue, song) => {
    const row1 = new ActionRowBuilder().addComponents([
        new ButtonBuilder()
            .setCustomId(`autoplay`)
            .setEmoji('<:update:1265562455828987968>')
            .setStyle(queue.autoplay ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`previous`) // Note the buttons ID is on the left of the _ and the id is on the right. Also note your CANNOT have another _ in the customid eg `my_coolbutton_${target.id}`
            .setEmoji('<:backforward:1265557186621345833>')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(queue.previousSongs.length === 0),
        new ButtonBuilder()
            .setCustomId(`togglePause`)
            .setEmoji(queue.paused ? '<:play:1265561505458294826>' : '<:pause:1265561390358331462>')
            .setStyle(queue.paused ? ButtonStyle.Primary : ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`skip`)
            .setEmoji('<:frontforward:1265560424510787584>')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(queue.autoplay ? false : queue.songs.length === 1),
        new ButtonBuilder()
            .setCustomId(`shuffle`)
            .setEmoji('<:shuffle:1265561846690222081>')
            .setStyle(ButtonStyle.Secondary)
    ])
    // next column
    const row2 = new ActionRowBuilder().addComponents([
        new ButtonBuilder()
            .setCustomId(`loop`)
            .setEmoji('<:loop2:1265560938417754213>')
            .setStyle(queue.repeatMode ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`volumeDown`)
            .setEmoji('<:speaker_low:1265561976663310386>')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(queue.volume <= 0),
        new ButtonBuilder()
            .setCustomId(`stop`)
            .setEmoji('<:stop:1265562218498363422>')
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId(`volumeUp`)
            .setEmoji('<:speaker:1265561928533807146>')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(queue.volume >= 200),
        new ButtonBuilder()
            .setCustomId(`related`)
            .setEmoji('<:add:1265556973202706503>')
            .setStyle(ButtonStyle.Secondary)
    ])
    // next column
    const row3 = new ActionRowBuilder().addComponents([
        new ButtonBuilder()
            .setCustomId(`queue`)
            .setEmoji('<:queue:1265561609632485478>')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`addSong`)
            .setEmoji('<:friend:1265560408895524957>')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`filters`)
            .setEmoji('<:spark:1265561903195750471>')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('lyrics')
            .setEmoji('<:list:1265560873876062340>')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`playlist:save`)
            .setEmoji('<:download:1320298270739791973>')
            .setStyle(ButtonStyle.Secondary)
    ])

    return [row1, row2, row3]
}

/**
 *
 * @param {Number} length
 * @param {Number} totalLength
 * @param {Number} barLength
 * @returns
 */
const generateProgressBar = (length, totalLength, barLength = 22) => {
    let progress = Math.floor((length / totalLength) * barLength)
    progress = Math.min(progress, barLength)

    // 定義六種不同的符號
    const leftEmpty = '<:leftempty:1320325939137351711>' // 左邊空
    const middleEmpty = '<:midempty:1320325989850415196>' // 中間空
    const rightEmpty = '<:rightempty:1320325997203296276>' // 右邊空
    const leftFilled = '<:leftfull:1320326004631142412>' // 左邊滿
    const middleFilled = '<:midfull:1320326013523329035>' // 中間滿
    const rightFilled = '<:rightfull:1320326021689638943>' // 右邊滿

    let progressBar = ''

    if (progress === 0) {
        // 全部未播放，使用全空的符號
        progressBar = leftEmpty + middleEmpty.repeat(barLength - 2) + rightEmpty
    } else if (progress === barLength) {
        // 全部已播放
        progressBar = leftFilled + middleFilled.repeat(barLength - 2) + rightFilled
    } else {
        // 部分播放
        progressBar = leftFilled // 開始符號使用已播放的左邊符號

        // 處理中間部分
        if (progress > 1) {
            progressBar += middleFilled.repeat(progress - 1)
        }

        // 處理未播放部分
        if (progress < barLength - 1) {
            progressBar += middleEmpty.repeat(barLength - progress - 1)
        }

        // 結束符號根據是否到達最後決定
        progressBar += progress === barLength - 1 ? rightFilled : rightEmpty
    }

    return progressBar
}

/**
 *
 * @param {Queue} queue
 * @param {Boolean} completed
 * @returns
 */
const updateMusicPlayerStatus = async (queue, completed) => {
    if (!queue?.textChannel) return

    if (!queue.musicControllerMsgId) return

    const msg = queue?.textChannel?.messages.cache.get(queue.musicControllerMsgId)
    if (!msg) return

    const song = queue.songs[0]
    if (!song) {
        // 如果沒有歌曲，清除播放器
        clearPlayer(queue)
        return
    }

    if (completed) resetPlayer(queue)
    await msg.edit(generateMusicPlayerStatus(queue, song, completed))
}

/**
 *
 * @param {Queue} queue
 */
const clearPlayer = (queue) => {
    resetPlayer(queue)
    clearInterval(queue.playerIntervalId)
}

/**
 *
 * @param {Queue} queue
 */
const resetPlayer = (queue) => {
    queue.musicControllerMsgId = null
}

/**
 *
 * @param {Queue} queue
 * @param {Song} song
 */
const generateMusicPlayerStatus = (queue, song, completed = false) => {
    // 檢查必要的屬性是否存在
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

    // 獲取歌曲時長，如果不存在則設為 0
    const songDuration = song.duration || 0

    const previousSongsLength = queue.previousSongs.reduce((store, curr) => {
        const duration = curr.stream.playFromSource ? curr.duration : curr.stream.song.duration

        return store + duration
    }, 0)

    let queuePlayedLength = previousSongsLength + queue.currentTime
    if (completed) queuePlayedLength += songDuration
    // const totalQueueLength = previousSongsLength + songDuration;

    return {
        embeds: [
            new EmbedBuilder()
                .setColor(queue.paused ? 'Orange' : 'Green')
                .setDescription(
                    `<:music:1265561113039208512> | [${song.name}](${song.url}) - \` ${
                        song.stream?.playFromSource
                            ? secondsToDuration(songDuration)
                            : secondsToDuration(queue.currentTime)
                    } \``
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
                    text: `在 ${queue.voiceChannel.name} 中播放`
                })
        ],
        components: completed ? [] : generateMusicStatusButtons(queue, song)
    }
}

const deleteMessageAfter = (msg, time = 15 * 1000) => {
    setTimeout(() => msg.delete(), time)
}

module.exports = {
    updateMusicPlayerStatus,
    clearPlayer,
    resetPlayer,
    generateProgressBar,
    generateMusicPlayerStatus,
    generateMusicStatusButtons,
    deleteMessageAfter
}
