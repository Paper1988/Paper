import type { EventType } from '@/typings/event'
import { EmbedBuilder, Events, Message, VoiceChannel, VoiceState } from 'discord.js'
import { Queue } from 'Distube'
import { DisTube } from 'distube'
import emojis from '../../libs/emoji/emoji'
import { clearPlayer, deleteMessageAfter } from '../../Systems/Music'

// 存儲頻道空閒計時器
const emptyChannelTimers = new Map()

const isChannelEmpty = (channel: VoiceChannel) => {
    const humanCount = channel.members.filter((member) => !member.user.bot).size
    return humanCount === 0
}

const setEmptyChannelTimer = (queue: Queue) => {
    if (emptyChannelTimers.has(queue.id)) {
        clearTimeout(emptyChannelTimers.get(queue.id))
    }

    const timer = setTimeout(async () => {
        if (isChannelEmpty(queue.voiceChannel as VoiceChannel)) {
            await queue
                .textChannel!.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(
                                `${emojis.musicstop} | 由於語音頻道已空超過1分鐘，已停止播放`
                            )
                    ]
                })
                .then((msg) => deleteMessageAfter(msg, 30 * 1000))

            clearPlayer(queue)
            queue.stop()
            queue.voice.leave()
            emptyChannelTimers.delete(queue.id)
        }
    }, 60 * 1000) // 60秒

    emptyChannelTimers.set(queue.id, timer)
}

declare module 'discord.js' {
    interface Client {
        distube: DisTube
    }
}

export default {
    name: Events.VoiceStateUpdate,
    async execute(client, oldState: VoiceState, newState: VoiceState) {
        if (!oldState?.channel) return
        const queue = (oldState.client.distube as DisTube).queues.get(oldState) as Queue
        if (!queue) return

        // 如果是機器人的語音狀態改變，不處理
        if (oldState.member?.id === oldState.client.user.id) return

        // 檢查新的頻道狀態
        if (isChannelEmpty(oldState?.channel as VoiceChannel)) {
            await queue.pause()
            queue
                .textChannel!.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(
                                `${emojis.warning} | 語音頻道已空，<t:${Date.now() + 60 * 1000}:R>將停止播放並退出語音頻道`
                            )
                            .setFooter({ text: '• 重新加入語音頻道來維持播放' })
                    ]
                })
                .then((msg: Message) => deleteMessageAfter(msg, 60 * 1000))

            setEmptyChannelTimer(queue)
        } else {
            await queue.resume()
            // 如果頻道不為空，清除計時器
            if (emptyChannelTimers.has(queue.id)) {
                clearTimeout(emptyChannelTimers.get(queue.id))
                emptyChannelTimers.delete(queue.id)
            }
        }
    }
} satisfies EventType
