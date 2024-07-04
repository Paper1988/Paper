module.exports = {
    id: 'false',
    async execute(interaction, client) {
        const { member } = interaction
        const VoiceChannel = member.voice.channel
        const queue = client.distube.getQueue(VoiceChannel)

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
        if (!queue)
            return interaction.reply({
                content:
                    '<:outage_868122243845206087:1202112862990897172> | 找不到歌曲或該歌曲已經播放完畢!',
                ephemeral: true
            })

        await queue.filters.clear()
        return interaction.reply({
            content: `<:linkremove_865572289022394368:1201843685084647435> | 成功移除所有過濾器`,
            ephemeral: true
        })
    }
}
