const { Events } = require('discord.js')
const { EmbedBuilder } = require('discord.js')
const { emojis } = require('../../libs/emoji/emoji')
const { deleteMessageAfter, clearPlayer } = require('../../Systems/Music')

// 存儲頻道空閒計時器
const emptyChannelTimers = new Map()

// 檢查語音頻道是否為空（排除機器人）
const isChannelEmpty = (channel) => {
    const humanCount = channel.members.filter((member) => !member.user.bot).size
    return humanCount === 0
}

// 設置空頻道計時器
const setEmptyChannelTimer = (queue) => {
    if (emptyChannelTimers.has(queue.id)) {
        clearTimeout(emptyChannelTimers.get(queue.id))
    }

    const timer = setTimeout(async () => {
        if (queue && isChannelEmpty(queue.voiceChannel)) {
            await queue.textChannel
                .send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(
                                `${emojis.musicstop} | 由於語音頻道已空超過1分鐘，已自動停止播放`
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

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {
        const queue = oldState.client.distube.getQueue(oldState.guild.id)
        if (!queue) return

        // 如果是機器人的語音狀態改變，不處理
        if (oldState.member.id === oldState.client.user.id) return

        // 檢查新的頻道狀態
        if (isChannelEmpty(queue.voiceChannel)) {
            queue.textChannel
                .send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(
                                `${emojis.warning} | 語音頻道已空，1分鐘後將自動停止播放\n-# • 加入語音頻道來維持播放`
                            )
                    ]
                })
                .then((msg) => deleteMessageAfter(msg, 30 * 1000))

            setEmptyChannelTimer(queue)
        } else {
            // 如果頻道不為空，清除計時器
            if (emptyChannelTimers.has(queue.id)) {
                clearTimeout(emptyChannelTimers.get(queue.id))
                emptyChannelTimers.delete(queue.id)
            }
        }
    }
}
