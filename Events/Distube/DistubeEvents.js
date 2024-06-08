const client = require('../../index.js')
const { EmbedBuilder } = require('discord.js')
const { Events } = require('distube')
const DB = require('../../Structures/Schemas/MusicDB.js')
const MusicEmbed = require('../../Systems/MusicEmbed.js')
const MusicButtons = require('../../Systems/MusicButtons.js')

client.distube
    .on(Events.PLAY_SONG, async (queue, song) => {
        const message = await queue.textChannel.send({
            embeds: [MusicEmbed(queue, song)],
            components: MusicButtons
        })
        await DB.findOneAndUpdate({ GuildID: queue.id }, { message: message.id }, { upsert: true })
            .exec()
            .then(async () => {
                const Data = await DB.findOne({ GuildID: queue.id })
                const msg = await queue.textChannel.messages.fetch(Data.message)
                if (msg) {
                    const update = setInterval(
                        () =>
                            msg.edit({ embeds: [MusicEmbed(queue, song)] }).catch(() => {
                                clearInterval(this.update)
                            }),
                        5000
                    )
                    module.exports = { update }
                }
            })
    })
    .on(Events.ADD_SONG, (queue, song) => {
        let embed = MusicEmbed(queue, song)
        embed.data.fields = null
        queue.textChannel
            .send({
                embeds: [
                    embed.setDescription(
                        `<:plus_988409343743496232:1202215484318302208> | 加入 [${song.name}](${song.url}) - \`${song.formattedDuration}\` 到清單中`
                    )
                ]
            })
            .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
    })
    .on(Events.ADD_LIST, (queue, playlist) => {
        let embed = MusicEmbed(queue, playlist.songs[0])
        embed.data.fields = null
        queue.textChannel
            .send({
                embeds: [
                    embed.setDescription(
                        `<:plus_988409343743496232:1202215484318302208> | 加入 [${playlist.name}](${playlist.url}) 播放清單 (\`${playlist.songs.length}\`首歌) 到清單中`
                    )
                ]
            })
            .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
    })
    .on(Events.ERROR, (e, channel, song) => {
        channel
            .send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(
                            `<:outage_868122243845206087:1202112862990897172> | 發生錯誤: ${e.toString().slice(0, 1974)}`
                        )
                ]
            })
            .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
    })
    .on(Events.EMPTY, (queue) =>
        queue.textChannel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor('Red')
                    .setDescription(
                        '<:nomember_859424400557604886:1201843730626400256> | 語音頻道是空的！<:leave_860487640113217546:1202217506991771658>離開頻道中...'
                    )
            ]
        })
    )
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
        DB.findOneAndUpdate({ GuildID: queue.id }, { message: '' }).exec()
    })
    .on(Events.INIT_QUEUE, async (queue) => {
        let Data = await DB.findOne({ GuildID: queue.id })
        if (!Data) {
            Data = new DB({
                GuildID: queue.id,
                volume: queue.volume,
                autoplay: queue.autoplay,
                repeatMode: queue.repeatMode,
                message: ''
            })
            await Data.save()
        }
        queue.autoplay = Data.autoplay
        queue.volume = Data.volume
        queue.repeatMode = Data.repeatMode
        queue.paused = false
    })
    .on(Events.FINISH_SONG, async (queue, song) => {
        let Data = await DB.findOne({ GuildID: queue.id })
        const msg = await queue.textChannel.messages.fetch(Data.message)
        if (queue.repeatMode === 1) return
        else if (queue.repeatMode === 2 && queue.songs[1]) return await msg.delete()
        await msg.delete()
    })
    .on(Events.NO_RELATED, async (queue, error) => {
        queue.textChannel.send(
            `<:warning_908958943466893323:1201844340276862976> | 找不到任何相關歌曲!`
        )
    })
    .on(Events.FFMPEG_DEBUG, async (debug) => {
        console.log(debug)
    })
