const MusicDB = require('../../Structures/Schemas/MusicDB')

module.exports = {
    id: 'autoplay',
    async execute(interaction, client) {
        await interaction.deferReply({ fetchReply: true })
        const { member, guild } = interaction
        const VoiceChannel = member.voice.channel

        if (!VoiceChannel)
            return await interaction
                .editReply({
                    content:
                        '<:warning:1265562532857380936> | 你必須待在語音頻道裡面才能使用音樂按鈕!'
                })
                .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
        if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
            return await interaction
                .editReply({
                    content: `<:warning:1265562532857380936> | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`
                })
                .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))

        const queue = await client.distube.getQueue(VoiceChannel)
        if (!queue)
            return await interaction
                .editReply({
                    content: '<:outage:1265561329528471613> | 找不到歌曲或該歌曲已經播放完畢!'
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
                    Mode ? '<:correct:1265560254708711467>' : '<:xmark:1265562550947545089>'
                }`
            })
            .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
    }
}
