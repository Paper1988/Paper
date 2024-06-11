const { Events } = require('distube')

module.exports = {
    id: 'skip',
    async execute(interaction, client) {
        // To access an id / value from a button you MUST INCLUDE `client` AND `args` and in the same order as shown
        const { member } = interaction
        const VoiceChannel = member.voice.channel

        if (!VoiceChannel)
            return interaction.reply({
                content:
                    '<:warning_908958943466893323:1201844340276862976> | 你必須待在一個語音頻道裡面才能使用音樂按鈕!',
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
        if (!queue.songs[1] && !queue.autoplay)
            return interaction.reply({
                content: '<:outage_868122243845206087:1202112862990897172> | 這是最後一首歌了!',
                ephemeral: true
            })

        await queue.skip(VoiceChannel)
        if (queue.autoplay && queue.songs[1]) {
            await queue.emit(Events.FINISH_SONG, queue)
            await queue.emit(Events.PLAY_SONG, queue, queue.songs[1])
        }
        return interaction.reply({
            content: '<:frontforward_988409335791124551:1202215991694856262> | 成功跳過歌曲',
            ephemeral: true
        })
    }
}
