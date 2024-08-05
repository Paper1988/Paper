module.exports = {
    id: 'false',
    async execute(interaction, client) {
        await interaction.deferReply({ fetchReply: true })
        const { member } = interaction
        const VoiceChannel = member.voice.channel
        const queue = client.distube.getQueue(VoiceChannel)

        if (!VoiceChannel)
            return await interaction.editReply({
                content:
                    '<:warning_908958943466893323:1201844340276862976> | 你必須待在語音頻道裡面才能使用音樂按鈕!',
                ephemeral: true
            })
        if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
            return await interaction.editReply({
                content: `<:warning_908958943466893323:1201844340276862976> | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`,
                ephemeral: true
            })
        if (!queue)
            return await interaction.editReply({
                content:
                    '<:outage_868122243845206087:1202112862990897172> | 找不到歌曲或該歌曲已經播放完畢!',
                ephemeral: true
            })

        await queue.filters.clear()
        return await interaction.editReply({
            content: `<:linkremove_865572289022394368:1201843685084647435> | 成功移除所有過濾器`,
            ephemeral: true
        })
    }
}
