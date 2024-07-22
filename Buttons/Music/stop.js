const { updateMusicPlayerStatus, clearPlayer } = require('../../Systems/Music')

module.exports = {
    id: 'stop',
    async execute(interaction, client) {
        // To access an id / value from a button you MUST INCLUDE `client` AND `args` and in the same order as shown
        const { member } = interaction
        const VoiceChannel = member.voice.channel

        if (!VoiceChannel)
            return interaction.reply({
                content:
                    '<:warning_908958943466893323:1201844340276862976> | 你必須待在語音頻道裡面才能使用音樂按鈕!',
                ephemeral: true
            })
        if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
            return interaction.reply({
                content: `<:warning_908958943466893323:1201844340276862976> | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`,
                ephemeral: true
            })

        const queue = client.distube.getQueue(VoiceChannel)
        if (!queue)
            return interaction.reply({
                content:
                    '<:outage_868122243845206087:1202112862990897172> | 找不到歌曲或該歌曲已經播放完畢!',
                ephemeral: true
            })

        await queue.stop(VoiceChannel)
        await updateMusicPlayerStatus(queue, true)
        clearPlayer(queue)
        await queue.voice.leave()
        await interaction
            .reply({
                content:
                    '<:stop_988409337837924422:1201844316675510364> | 成功停止音樂並退出語音頻道'
            })
            .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
    }
}
