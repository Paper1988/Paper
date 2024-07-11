const client = require('../../index.js')
const { EmbedBuilder } = require('discord.js')
const { Events, RepeatMode } = require('distube')
const DB = require('../../Structures/Schemas/MusicDB.js')
const {
    generateMusicPlayerStatus,
    updateMusicPlayerStatus,
    clearPlayer
} = require('../../Systems/Music')

client.distube
    .on(Events.PLAY_SONG, async (queue, song) => {
        const msg = await queue.textChannel.send(generateMusicPlayerStatus(queue, song))
        client.musicControllerMsgId = msg.id
    })
    .on(Events.ADD_SONG, (queue, song) => {
        const { embeds } = generateMusicPlayerStatus(queue, song)
        embeds[0].data.fields = null
        queue.textChannel
            .send({
                embeds: [
                    embeds[0].setDescription(
                        `<:plus_988409343743496232:1202215484318302208> | 加入 [${song.name}](${song.url}) - \`${song.formattedDuration}\` 到清單中`
                    )
                ]
            })
            .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
    })
    .on(Events.ADD_LIST, (queue, playlist) => {
        const { embeds } = generateMusicPlayerStatus(queue, playlist.songs[0])
        embeds[0].data.fields = null
        queue.textChannel
            .send({
                embeds: [
                    embeds[0].setDescription(
                        `<:plus_988409343743496232:1202215484318302208> | 加入 [${playlist.name}](${playlist.url}) 播放清單 (\`${playlist.songs.length}\`首歌) 到清單中`
                    )
                ]
            })
            .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
    })
    .on(Events.ERROR, (e, queue, song) => {
        queue.textChannel
            .send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setTitle('<:outage_868122243845206087:1202112862990897172> | 發生錯誤:')
                        .setDescription(`${e.toString().slice(0, 1974)}`)
                        .setFooter({ text: `請使用 /report 協助回報!` })
                ]
            })
            .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
    })
    .on(Events.FINISH, (queue) => {
        queue.textChannel
            .send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(
                            `<:musicstop_861852633979420712:1201843718215438386> | 清單播放完畢！`
                        )
                ]
            })
            .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
        clearPlayer(queue)
    })
    .on(Events.INIT_QUEUE, async (queue) => {
        clearPlayer(queue)
        let Data = await DB.findOne({ GuildID: queue.id })
        if (!Data) {
            Data = new DB({
                GuildID: queue.id,
                volume: queue.volume,
                autoplay: queue.autoplay,
                repeatMode: queue.repeatMode
            })
            await Data.save()
        }
        queue.autoplay = Data.autoplay
        queue.volume = Data.volume
        queue.repeatMode = Data.repeatMode
        queue.paused = false
        queue.playerIntervalId = setInterval(async () => {
            await updateMusicPlayerStatus(queue)
        }, 1000 * 5)
    })
    .on(Events.DELETE_QUEUE, (queue) => {
        clearPlayer(queue)
    })
    .on(Events.FINISH_SONG, async (queue, song) => {
        if (queue.repeatMode === RepeatMode.DISABLED) return updateMusicPlayerStatus(queue, true)
        if (queue.repeatMode === RepeatMode.SONG) return updateMusicPlayerStatus(queue, false)
        if (queue.repeatMode === RepeatMode.QUEUE && (queue.songs[1] || queue.autoplay))
            return updateMusicPlayerStatus(queue, false)
        else if (!queue.songs[1]) return updateMusicPlayerStatus(queue, true)
    })
    .on(Events.NO_RELATED, async (queue, error) => {
        queue.textChannel.send(
            `<:warning_908958943466893323:1201844340276862976> | 找不到任何相關歌曲!`
        )
    })
    .on(Events.DISCONNECT, (queue) => {
        clearPlayer(queue)
    })
