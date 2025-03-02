const MusicDB = require('../../Structures/Schemas/MusicDB')
const { emojis } = require('./../../libs/emoji/emoji')

module.exports = {
    id: 'autoplay',
    async execute(interaction, client) {
        await interaction.deferReply()
        const { member, guild } = interaction
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

        const Mode = await queue.toggleAutoplay(VoiceChannel)

        await MusicDB.findOneAndUpdate(
            { GuildID: guild.id },
            { autoplayMode: Mode ? true : false },
            { new: true, upsert: true }
        )

        return await interaction
            .editReply({
                content: `<:update:1265562455828987968> | 成功切換自動播放模式: ${
                    Mode ? emojis.correct : emojis.xmark
                }`
            })
            .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
    }
}
