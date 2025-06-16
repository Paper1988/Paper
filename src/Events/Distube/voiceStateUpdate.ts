import { PaperClient } from '@/classes/PaperClient'
import emojis from '@/libs/emoji/emoji'
import { clearPlayer, deleteMessageAfter } from '@/Systems/Music'
import type { EventType } from '@/typings/event'
import { EmbedBuilder, Events, Message, VoiceChannel, VoiceState } from 'discord.js'
import { DisTube, Queue } from 'distube'

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
    }, 60 * 1000)

    emptyChannelTimers.set(queue.id, timer)
}

declare module 'discord.js' {
    interface Client {
        distube: DisTube
    }
}

export default {
    name: Events.VoiceStateUpdate,
    async execute(client: PaperClient, oldState: VoiceState) {
        if (!oldState?.channel) return
        const queue = (oldState.client.distube as DisTube).queues.get(oldState) as Queue
        if (!queue) return

        if (oldState.member?.id === oldState.client.user.id) return

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
            if (emptyChannelTimers.has(queue.id)) {
                clearTimeout(emptyChannelTimers.get(queue.id))
                emptyChannelTimers.delete(queue.id)
            }
        }
    }
} satisfies EventType
