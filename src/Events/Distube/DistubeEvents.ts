import DB from '@/Structures/Schemas/MusicDB.js'
import {
    clearPlayer,
    deleteMessageAfter, // default 15s
    generateMusicPlayerStatus,
    updateMusicPlayerStatus
} from '@/Systems/Music'
import client from '@/index.js'
import emojis from '@/libs/emoji/emoji.js'
import { EmbedBuilder, Message } from 'discord.js'

import { DisTubeError, Events, Playlist, Queue, RepeatMode, Song } from 'distube'

declare module 'distube' {
    interface Queue {
        musicControllerMsgId: string
        playerIntervalId: NodeJS.Timeout
    }
}

client.distube
    .on(Events.PLAY_SONG, async (queue: Queue, song: Song) => {
        try {
            if (!song || !queue) return

            const status = generateMusicPlayerStatus(queue, song)
            if (queue.textChannel) {
                const msg = await queue.textChannel.send(status)
                queue.musicControllerMsgId = msg.id
            }
        } catch (error) {
            console.error('播放歌曲時發生錯誤:', error)
            if (queue?.textChannel) {
                queue.textChannel
                    .send({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Red')
                                .setDescription(
                                    `${emojis.outage} | 播放播放清單時發生錯誤，請協助回報！`
                                )
                        ]
                    })
                    .then((msg) => deleteMessageAfter(msg))
            }
        }
    })
    .on(Events.ADD_SONG, (queue: Queue, song: Song) => {
        const { embeds } = generateMusicPlayerStatus(queue, song)
        embeds[0]!.data.fields = undefined
        queue
            .textChannel!.send({
                embeds: [
                    embeds[0]!.setDescription(
                        `${emojis.plus} | 加入 [${song.name}](${song.url}) - \`${song.formattedDuration}\` 到清單中`
                    )
                ]
            })
            .then((msg: Message) => deleteMessageAfter(msg))
    })
    .on(Events.ADD_LIST, (queue: Queue, playlist: Playlist) => {
        const { embeds } = generateMusicPlayerStatus(queue, playlist.songs[0])
        embeds[0]!.data.fields = undefined

        let name: string

        playlist.url
            ? (name = `[${playlist.name}](${playlist.url})`)
            : (name = `**${playlist.name}**`)

        queue
            .textChannel!.send({
                embeds: [
                    embeds[0]!.setDescription(
                        `${emojis.plus} | 加入 ${name} 播放清單 (\`${playlist.songs.length}\`首歌) 到清單中`
                    )
                ]
            })
            .then((msg: Message) => deleteMessageAfter(msg))
    })
    .on(Events.ERROR, async (error: any, queue: Queue, song: Song | undefined) => {
        await updateMusicPlayerStatus(queue, true)
        clearPlayer(queue)

        let errorMessage = ''

        if (
            error instanceof DisTubeError &&
            error.errorCode === 'SOUNDCLOUD_PLUGIN_NO_RESULT' &&
            song?.source === 'spotify'
        ) {
            errorMessage =
                `無法在 SoundCloud 上找到歌曲：**${song.name}**\n` +
                `這首歌是從 Spotify 取得的資訊，但在 SoundCloud 上找不到對應的歌曲。\n` +
                `建議：\n` +
                `1. 嘗試使用歌曲名稱直接搜尋\n` +
                `2. 使用其他音樂平台的連結`
        } else {
            errorMessage = error.toString().slice(0, 1974)
        }

        await queue
            .textChannel!.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setTitle(`${emojis.outage} | 發生錯誤:`)
                        .setDescription(`\`\`\`${errorMessage}\`\`\``)
                        .setFooter({ text: `請使用 /feedback 協助回報!` })
                ]
            })
            .then((msg: Message) => deleteMessageAfter(msg, 30 * 1000))
    })
    .on(Events.FINISH, (queue) => {
        clearPlayer(queue)
        queue
            .textChannel!.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(`${emojis.musicstop} | 清單播放完畢！`)
                ]
            })
            .then((msg: Message) => deleteMessageAfter(msg))
    })
    .on(Events.INIT_QUEUE, async (queue: Queue) => {
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
        queue.musicControllerMsgId = ''
        queue.playerIntervalId = setInterval(() => updateMusicPlayerStatus(queue), 3 * 1000)
    })
    .on(Events.DELETE_QUEUE, (queue: Queue) => clearPlayer(queue))
    .on(Events.FINISH_SONG, async (queue: Queue, song: Song) => {
        try {
            if (queue.repeatMode === RepeatMode.DISABLED) {
                await updateMusicPlayerStatus(queue, true)
            }
            if (queue.repeatMode === RepeatMode.SONG)
                return await updateMusicPlayerStatus(queue, false)

            if (queue.repeatMode === RepeatMode.QUEUE && (queue.songs[1] || queue.autoplay))
                await updateMusicPlayerStatus(queue, false)
            else if (!queue.songs[1]) await updateMusicPlayerStatus(queue, true)
        } catch (error) {
            console.error('處理歌曲結束時發生錯誤:', error)
            clearPlayer(queue)
        }
    })
    .on(Events.NO_RELATED, (queue: Queue) =>
        queue.textChannel!.send(`${emojis.warning} | 找不到任何相關歌曲!`)
    )
    .on(Events.DEBUG, async (msg: string) => {
        await client
            .fetchWebhook(
                '1344304470615654430',
                'dEoxkelcoU5IUgTO6cK1THh5yGVyzy26pu_mc48B1yPH8bYySpmn0U7v-RN0_qx215Lk'
            )
            .then((webhook) =>
                webhook.send({
                    embeds: [new EmbedBuilder().setDescription(`\`\`\`\n${msg}\n\`\`\``)]
                })
            )
    })
    .on(Events.FFMPEG_DEBUG, (msg: string) => console.log(msg))
    .on(Events.DISCONNECT, (queue: Queue) => clearPlayer(queue))
