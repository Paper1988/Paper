const { updateMusicPlayerStatus, clearPlayer } = require('../../Systems/Music')

module.exports = {
    id: 'stop',
    async execute(interaction, client) {
        await interaction.deferReply()
        // To access an id / value from a button you MUST INCLUDE `client` AND `args` and in the same order as shown
        const { member } = interaction
        const VoiceChannel = member.voice.channel

        if (!VoiceChannel)
            return await interaction
                .editReply({
                    content:
                        '<:warning:1265562532857380936> | 你必須待在語音頻道裡面才能使用音樂按鈕!'
                })
                .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
        if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
            return await interaction
                .editReply({
                    content: `<:warning:1265562532857380936> | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`
                })
                .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))

        const queue = await client.distube.getQueue(VoiceChannel)
        if (!queue)
            return await interaction
                .editReply({
                    content: '<:outage:1265561329528471613> | 找不到歌曲或該歌曲已經播放完畢!'
                })
                .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))

        await updateMusicPlayerStatus(queue, true)
        clearPlayer(queue)
        await queue.stop(VoiceChannel)
        await queue.voice.leave()
        await interaction
            .editReply({
                content: '<:stop:1265562218498363422> | 成功停止音樂並退出語音頻道'
            })
            .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
    }
}
