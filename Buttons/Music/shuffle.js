module.exports = {
    id: 'shuffle',
    async execute(interaction, client) {
        await interaction.deferReply({ fetchReply: true, ephemeral: true })
        const { member } = interaction
        const VoiceChannel = member.voice.channel
        if (!VoiceChannel)
            return interaction.editReply({
                content:
                    '<:warning_908958943466893323:1201844340276862976> | 你必須待在語音頻道裡面才能使用音樂按鈕!',
                ephemeral: true
            })
        if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
            return interaction.editReply({
                content: `<:warning_908958943466893323:1201844340276862976> | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`,
                ephemeral: true
            })
        const queue = client.distube.getQueue(VoiceChannel)
        if (!queue)
            return interaction.editReply({
                content:
                    '<:outage_868122243845206087:1202112862990897172> | 找不到歌曲或該歌曲已經播放完畢!',
                ephemeral: true
            })

        await queue.shuffle(VoiceChannel)
        return interaction.editReply({
            content: '<:shuffle_988409354208313404:1201844292751212574> | 成功隨機打亂歌曲',
            ephemeral: true
        })
    }
}
