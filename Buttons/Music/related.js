const { emojis } = require('../../libs/emoji/emoji')

module.exports = {
    id: 'related',
    async execute(interaction, client) {
        await interaction.deferReply()
        // To access an id / value from a button you MUST INCLUDE `client` AND `args` and in the same order as shown
        const { member } = interaction
        const VoiceChannel = member.voice.channel

        if (!VoiceChannel)
            return interaction
                .editReply({
                    content: `${emojis.warning} | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`
                })
                .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
        if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
            return interaction
                .editReply({
                    content: `${emojis.warning} | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`
                })
                .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))

        const queue = await client.distube.getQueue(VoiceChannel)
        if (!queue)
            return interaction
                .editReply({
                    content: `${emojis.outage} | 找不到歌曲或該歌曲已經播放完畢!`
                })
                .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))

        await queue.addRelatedSong(VoiceChannel)
        return interaction
            .editReply({
                content: `${emojis.plus} | 成功添加一首相似歌曲到播放清單中`
            })
            .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
    }
}
