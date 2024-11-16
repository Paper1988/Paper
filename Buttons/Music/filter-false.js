module.exports = {
    id: 'false',
    async execute(interaction, client) {
        await interaction.deferReply({ fetchReply: true })
        const { member } = interaction
        const VoiceChannel = member.voice.channel

        if (!VoiceChannel)
            return await interaction.editReply({
                content: '<:warning:1265562532857380936> | 你必須待在語音頻道裡面才能使用音樂按鈕!',
                ephemeral: true
            })
        if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
            return await interaction.editReply({
                content: `<:warning:1265562532857380936> | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`,
                ephemeral: true
            })
        const queue = await client.distube.getQueue(VoiceChannel)
        if (!queue)
            return await interaction.editReply({
                content: '<:outage:1265561329528471613> | 找不到歌曲或該歌曲已經播放完畢!',
                ephemeral: true
            })

        await queue.filters.clear()
        return await interaction.editReply({
            content: `<:linkremove:1265560814769672222> | 成功移除所有過濾器`,
            ephemeral: true
        })
    }
}
