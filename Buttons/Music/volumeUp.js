const MusicDB = require('../../Structures/Schemas/MusicDB')
module.exports = {
    id: 'volumeUp',
    async execute(interaction, client) {
        await interaction.deferReply({ fetchReply: true, ephemeral: true })
        // To access an id / value from a button you MUST INCLUDE `client` AND `args` and in the same order as shown
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

        await client.distube.setVolume(VoiceChannel, queue.volume + 10)

        await MusicDB.findOneAndUpdate(
            { GuildID: queue.id },
            { volume: queue.volume },
            { new: true, upsert: true }
        )
        return await interaction.editReply({
            content: `<:speaker:1265561928533807146> | 成功設置音量: \`${queue.volume}%\``,
            ephemeral: true
        })
    }
}
