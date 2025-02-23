const MusicDB = require('../../Structures/Schemas/MusicDB')
const { emojis } = require('../../libs/emoji/emoji')

module.exports = {
    id: 'volumeUp',
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

        await client.distube.setVolume(VoiceChannel, queue.volume + 10)

        await MusicDB.findOneAndUpdate(
            { GuildID: queue.id },
            { volume: queue.volume },
            { new: true, upsert: true }
        )
        return await interaction
            .editReply({
                content: `<:speaker:1265561928533807146> | 成功設置音量: \`${queue.volume}%\``
            })
            .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
    }
}
