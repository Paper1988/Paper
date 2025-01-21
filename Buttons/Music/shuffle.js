module.exports = {
    id: 'shuffle',
    async execute(interaction, client) {
        await interaction.deferReply({ fetchReply: TextTrackCueList })
        const { member } = interaction
        const VoiceChannel = member.voice.channel

        if (!VoiceChannel)
            return interaction
                .editReply({
                    content:
                        '<:warning:1265562532857380936> | 你必須待在語音頻道裡面才能使用音樂按鈕!'
                })
                .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
        if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
            return interaction
                .editReply({
                    content: `<:warning:1265562532857380936> | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`
                })
                .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))

        const queue = await client.distube.getQueue(VoiceChannel)
        if (!queue)
            return interaction
                .editReply({
                    content: '<:outage:1265561329528471613> | 找不到歌曲或該歌曲已經播放完畢!'
                })
                .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))

        await queue.shuffle(VoiceChannel)
        return interaction
            .editReply({
                content: '<:shuffle:1265561846690222081> | 成功隨機打亂歌曲'
            })
            .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
    }
}
