const { emojis } = require('../../libs/emoji/emoji')
const { updateMusicPlayerStatus } = require('../../Systems/Music')

module.exports = {
    id: 'skip',
    async execute(interaction, client) {
        await interaction.deferReply()
        // To access an id / value from a button you MUST INCLUDE `client` AND `args` and in the same order as shown
        const { member } = interaction
        const VoiceChannel = member.voice.channel

        if (!VoiceChannel)
            return await interaction
                .editReply({
                    content: `${emojis.warning} | 你必須待在語音頻道裡面才能使用音樂按鈕!`
                })
                .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
        if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
            return await interaction
                .editReply({
                    content: `${emojis.warning} | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`
                })
                .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))

        const queue = await client.distube.getQueue(VoiceChannel)
        if (!queue)
            return await interaction
                .editReply({
                    content: `${emojis.outage} | 找不到歌曲或該歌曲已經播放完畢!`
                })
                .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
        if (!queue.songs[1] && !queue.autoplay)
            return await interaction
                .editReply({
                    content: `${emojis.outage} | 這是最後一首歌了!`
                })
                .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))

        await queue.skip(VoiceChannel)
        await updateMusicPlayerStatus(queue, true)

        return await interaction
            .editReply({
                content: '<:frontforward:1265560424510787584> | 成功跳過歌曲'
            })
            .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
    }
}
