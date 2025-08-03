import { PaperClient } from '@/classes/PaperClient.js'
import emojis from '@/libs/emoji/emoji.js'
import { clearPlayer, deleteMessageAfter, updateMusicPlayerStatus } from '@/Systems/Music.js'
import type { EventType } from '@/typings/event.js'
import { EmbedBuilder, Events, Message, VoiceChannel, VoiceState } from 'discord.js'
import { Queue } from 'distube'

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
        if (queue.voiceChannel && isChannelEmpty(queue.voiceChannel as VoiceChannel)) {
            await queue
                .textChannel!.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(
                                `${emojis.musicstop} | 由於語音頻道已空超過1分鐘，已清除播放佇列`
                            )
                    ]
                })
                .then((msg) => deleteMessageAfter(msg, 30 * 1000))

            clearPlayer(queue)
            await updateMusicPlayerStatus(queue, true)
            queue.stop()
            queue.voice.leave()
            emptyChannelTimers.delete(queue.id)
        }
    }, 60 * 1000)

    emptyChannelTimers.set(queue.id, timer)
}

export default {
    name: Events.VoiceStateUpdate,
    async execute(client: PaperClient, oldState: VoiceState) {
        if (!client) return
        if (!oldState?.channel) return
        if (oldState.member?.id === oldState.client.user.id) return

        const queue = client.distube.getQueue(oldState.guild.id) as Queue
        if (!queue) return
        if (!queue.voiceChannel) return
        if (!queue.textChannel) return

        const emptyChannelMessages = new Map<string, Message>()

        if (isChannelEmpty(queue.voiceChannel as VoiceChannel)) {
            if (!queue.isPaused()) await queue.pause()
            const sentMsg = await queue.textChannel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(
                            `${emojis.warning} | 語音頻道已空，<t:${Math.floor((Date.now() + 60 * 1000) / 1000)}:R>將停止播放並退出語音頻道`
                        )
                        .setFooter({ text: '• 重新加入語音頻道來維持播放' })
                ]
            })

            emptyChannelMessages.set(queue.id, sentMsg)
            deleteMessageAfter(sentMsg, 60 * 1000)

            setEmptyChannelTimer(queue)
        } else {
            if (queue.isPaused()) await queue.resume()
            const lastMsg = emptyChannelMessages.get(queue.id)
            if (lastMsg) {
                try {
                    await lastMsg.delete()
                } catch {}
                emptyChannelMessages.delete(queue.id)
            }
            if (emptyChannelTimers.has(queue.id)) {
                clearTimeout(emptyChannelTimers.get(queue.id))
                emptyChannelTimers.delete(queue.id)
            }
        }
    }
} satisfies EventType
