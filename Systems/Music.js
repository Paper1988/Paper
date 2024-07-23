const { EmbedBuilder } = require('discord.js')
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const { Queue, Song } = require('distube')

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
const generateMusicStatusButtons = (queue) => {
    const row1 = new ActionRowBuilder().addComponents([
        new ButtonBuilder()
            .setCustomId(`autoplay`)
            .setEmoji('<:update_860123644297871382:1201844333968625695>')
            .setStyle(queue.autoplay ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`previous`) // Note the buttons ID is on the left of the _ and the id is on the right. Also note your CANNOT have another _ in the customid eg `my_coolbutton_${target.id}`
            .setEmoji('<:backforward_988409328698523708:1201843626435686440>')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(queue.previousSongs.length === 0),
        new ButtonBuilder()
            .setCustomId(`togglePause`)
            .setEmoji(
                queue.paused
                    ? '<:pause_861852632914198548:1201843739728035961>'
                    : '<:play_861852632800952320:1202112864857628692>'
            )
            .setStyle(queue.paused ? ButtonStyle.Primary : ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`skip`)
            .setEmoji('<:frontforward_988409335791124551:1202215991694856262>')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(queue.autoplay ? false : queue.songs.length === 1),
        new ButtonBuilder()
            .setCustomId(`shuffle`)
            .setEmoji('<:shuffle_988409354208313404:1201844292751212574>')
            .setStyle(ButtonStyle.Secondary)
    ])
    // next column
    const row2 = new ActionRowBuilder().addComponents([
        new ButtonBuilder()
            .setCustomId(`loop`)
            .setEmoji('<:loop_988409346637594744:1201843698976178246>')
            .setStyle(queue.repeatMode ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`volumeDown`)
            .setEmoji('<:speaker_low_860133546278387763:1201844302725255178>')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(queue.volume <= 0),
        new ButtonBuilder()
            .setCustomId(`stop`)
            .setEmoji('<:stop_988409337837924422:1201844316675510364>')
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId(`volumeUp`)
            .setEmoji('<:speaker_860133545544908802:1201844300099354644>')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(queue.volume >= 200),
        new ButtonBuilder()
            .setCustomId(`related`)
            .setEmoji('<:add_988409343743496232:1201843618508185600>')
            .setStyle(ButtonStyle.Secondary)
    ])
    // next column
    const row3 = new ActionRowBuilder().addComponents([
        new ButtonBuilder()
            .setCustomId(`queue`)
            .setEmoji('<:queue_861852633240961024:1202112866069520385>')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`addSong`)
            .setEmoji('<:friend_861852632767528970:1201843652704616448>')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`filters`)
            .setEmoji('<:spark_860123643722727444:1201844297041973320>')
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
const generateProgressBar = (length, totalLength, barLength = 20) => {
    let progress = Math.floor((length / totalLength) * barLength)
    progress = Math.min(progress, barLength)
    const progressBar = '▰'.repeat(progress) + '▱'.repeat(barLength - progress)
    return `[${progressBar}]`
}

/**
 *
 * @param {Queue} queue
 * @param {Boolean} completed
 * @returns
 */
const updateMusicPlayerStatus = async (queue, completed) => {
    if (!queue.client.musicControllerMsgId) return

    const msg = queue?.textChannel?.messages.cache.get(queue.client.musicControllerMsgId)
    if (!msg) return

    const song = queue.songs[0]
    if (!song) return

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
    queue.client.musicControllerMsgId = null
}

/**
 *
 * @param {Queue} queue
 * @param {Song} song
 */
const generateMusicPlayerStatus = (queue, song, completed = false) => {
    const previousSongsLength = queue.previousSongs.reduce((store, curr) => {
        const duration = curr.stream.playFromSource ? curr.duration : curr.stream.song.duration

        return store + duration
    }, 0)
    const songDuration = song.stream.playFromSource ? song.duration : song.stream.song.duration

    let queuePlayedLength = previousSongsLength + queue.currentTime
    if (completed) queuePlayedLength += songDuration
    // const totalQueueLength = previousSongsLength + songDuration;

    return {
        embeds: [
            new EmbedBuilder()
                .setColor('Green')
                .setDescription(
                    `<:music_860123644201271326:1201843716097327185> | [${song.name}](${
                        song.url
                    }) - \` ${
                        song.stream.playFromSource
                            ? song.formattedDuration
                            : song.stream.song?.formattedDuration
                    } \``
                )
                .setAuthor({
                    name: `${song.user.displayName}`,
                    iconURL: song.user.displayAvatarURL()
                })
                .addFields(
                    {
                        name: '<:speaker_860133545544908802:1201844300099354644>音量',
                        value: `\`${queue.volume}%\``,
                        inline: true
                    },
                    {
                        name: '<:spark_860123643722727444:1201844297041973320>過濾器',
                        value: `${
                            queue.filters.names.join(', ') ||
                            '<:xmark_988409378161954866:1201844342029815848>'
                        }`,
                        inline: true
                    },
                    {
                        name: '<:loop_861852632893227029:1201843696031764490>重複播放',
                        value: `${
                            queue.repeatMode
                                ? queue.repeatMode === 2
                                    ? '<:loop_988409346637594744:1201843698976178246>整個清單'
                                    : '<:looponce_988409348826992680:1201884069399363634>單曲'
                                : '<:xmark_988409378161954866:1201844342029815848>'
                        }`,
                        inline: true
                    },
                    {
                        name: '<:update_860123644297871382:1201844333968625695>自動播放',
                        value: `${
                            queue.autoplay
                                ? '<:correct_859388130411282442:1201843648229294121>'
                                : '<:xmark_988409378161954866:1201844342029815848>'
                        }`,
                        inline: true
                    },
                    {
                        name: '<:people_964425853930995783:1201843743762681906>歌曲作者',
                        value: `\`${song.uploader.name || '無'}\``,
                        inline: true
                    },
                    {
                        name: '<:clock_964491800465276940:1201843646203433030>進度',
                        value: `${
                            completed
                                ? `\`${secondsToDuration(songDuration)}\` - \`${secondsToDuration(songDuration)}\``
                                : `\`${secondsToDuration(queue.currentTime)}\` - \`${secondsToDuration(songDuration)}\``
                        }`,
                        inline: true
                    },
                    {
                        name: '進度條',
                        value: `${
                            completed
                                ? `${generateProgressBar(songDuration, songDuration, 28)}`
                                : `${generateProgressBar(queue.currentTime, songDuration, 28)}`
                        }`
                    }
                )
                .setImage(song.thumbnail)
                .setTimestamp()
        ],
        components: completed ? [] : generateMusicStatusButtons(queue)
    }
}

module.exports = {
    updateMusicPlayerStatus,
    clearPlayer,
    resetPlayer,
    generateProgressBar,
    generateMusicPlayerStatus,
    generateMusicStatusButtons
}
