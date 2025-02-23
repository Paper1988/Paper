const client = require('../../index.js')
const { EmbedBuilder, MessageFlags } = require('discord.js')
const { Events, RepeatMode } = require('distube')
const DB = require('../../Structures/Schemas/MusicDB.js')
const {
    generateMusicPlayerStatus,
    updateMusicPlayerStatus,
    clearPlayer,
    deleteMessageAfter // default 15s
} = require('../../Systems/Music')
const { emojis } = require('../../libs/emoji/emoji.js')

client.distube
    .on(Events.PLAY_SONG, async (queue, song) => {
        try {
            if (!song || !queue) return

            const status = generateMusicPlayerStatus(queue, song)
            if (queue.textChannel) {
                queue.textChannel.send(status).then((msg) => {
                    queue.musicControllerMsgId = msg.id
                })
            }
        } catch (error) {
            console.error('播放歌曲時發生錯誤:', error)
            if (queue?.textChannel) {
                queue.textChannel.send({
                    content: `${emojis.outage} | 播放歌曲時發生錯誤`,
                    flags: MessageFlags.Ephemeral
                })
            }
        }
    })
    .on(Events.ADD_SONG, (queue, song) => {
        const { embeds } = generateMusicPlayerStatus(queue, song)
        embeds[0].data.fields = null
        queue.textChannel
            .send({
                embeds: [
                    embeds[0].setDescription(
                        `${emojis.plus} | 加入 [${song.name}](${song.url}) - \`${song.formattedDuration}\` 到清單中`
                    )
                ]
            })
            .then((msg) => deleteMessageAfter(msg))
    })
    .on(Events.ADD_LIST, (queue, playlist) => {
        const { embeds } = generateMusicPlayerStatus(queue, playlist.songs[0])
        embeds[0].data.fields = null
        queue.textChannel
            .send({
                embeds: [
                    embeds[0].setDescription(
                        `${emojis.plus} | 加入 [${playlist.name}](${playlist.url}) 播放清單 (\`${playlist.songs.length}\`首歌) 到清單中`
                    )
                ]
            })
            .then((msg) => deleteMessageAfter(msg))
    })
    .on(Events.ERROR, async (e, queue, song) => {
        await updateMusicPlayerStatus(queue, true)
        clearPlayer(queue)

        let errorMessage = ''

        // 處理特定錯誤類型
        if (e.errorCode === 'SOUNDCLOUD_PLUGIN_NO_RESULT' && song?.source === 'spotify') {
            errorMessage =
                `${emojis.warning} | 無法在 SoundCloud 上找到歌曲：**${song.name}**\n` +
                `這首歌是從 Spotify 取得的資訊，但在 SoundCloud 上找不到對應的歌曲。\n` +
                `建議：\n` +
                `1. 嘗試使用歌曲名稱直接搜尋\n` +
                `2. 使用其他音樂平台的連結`
        } else {
            // 一般錯誤訊息
            errorMessage = e.toString().slice(0, 1974)
        }

        await queue.textChannel
            .send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setTitle(`${emojis.outage} | 發生錯誤:`)
                        .setDescription(errorMessage)
                        .setFooter({ text: `請使用 /report 協助回報!` })
                ]
            })
            .then((msg) => deleteMessageAfter(msg, 30 * 1000))
    })
    .on(Events.FINISH, (queue) => {
        clearPlayer(queue)
        queue.textChannel
            .send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(`${emojis.musicstop} | 清單播放完畢！`)
                ]
            })
            .then((msg) => deleteMessageAfter(msg, 30 * 1000))
    })
    .on(Events.INIT_QUEUE, async (queue) => {
        clearPlayer(queue)
        let Data = await DB.findOne({ GuildID: queue.id })
            .exec()
            .catch((err) => {
                console.error('資料庫查詢錯誤: ', err)
                return null // 確保即使查詢失敗也能繼續執行
            })
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
        queue.musicControllerMsgId = null
        queue.playerIntervalId = setInterval(
            async () => await updateMusicPlayerStatus(queue),
            3 * 1000
        )
    })
    .on(Events.DELETE_QUEUE, (queue) => clearPlayer(queue))
    .on(Events.FINISH_SONG, async (queue, song) => {
        try {
            if (queue.repeatMode === RepeatMode.DISABLED) {
                await updateMusicPlayerStatus(queue, true)
                clearPlayer(queue)
            } else if (queue.repeatMode === RepeatMode.SONG)
                return await updateMusicPlayerStatus(queue, false)

            if (queue.repeatMode === RepeatMode.QUEUE && (queue.songs[1] || queue.autoplay))
                await updateMusicPlayerStatus(queue, false)
            else if (!queue.songs[1]) await updateMusicPlayerStatus(queue, true)
        } catch (error) {
            console.error('處理歌曲結束時發生錯誤:', error)
            clearPlayer(queue)
            if (queue?.textChannel) {
                queue.textChannel.send({
                    content: `${emojis.outage} | 播放已結束`
                })
            }
        }
    })
    .on(Events.NO_RELATED, (queue) =>
        queue.textChannel.send(`${emojis.warning} | 找不到任何相關歌曲!`)
    )
    .on(Events.DEBUG, (msg) => console.log(msg))
    .on(Events.FFMPEG_DEBUG, (msg) => console.log(msg))
    .on(Events.DISCONNECT, (queue) => clearPlayer(queue))
