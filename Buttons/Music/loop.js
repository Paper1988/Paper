const MusicDB = require('../../Structures/Schemas/MusicDB')
const { updateMusicPlayerStatus } = require('../../Systems/Music')

module.exports = {
    id: 'loop',
    async execute(interaction, client) {
        await interaction.deferReply({ fetchReply: true, ephemeral: true })
        const { member, guild } = interaction
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

        const queue = client.distube.getQueue(VoiceChannel)
        if (!queue)
            return await interaction.editReply({
                content: '<:outage:1265561329528471613> | 找不到歌曲或該歌曲已經播放完畢!',
                ephemeral: true
            })

        let Mode = await client.distube.setRepeatMode(queue)

        updateMusicPlayerStatus(queue)

        await MusicDB.findOneAndUpdate(
            { GuildID: guild.id },
            { repeatMode: (Mode = Mode ? (Mode == 2 ? 2 : 1) : 0) },
            { new: true, upsert: true }
        )

        return await interaction.editReply({
            content: `<:loop1:1265560917345570918> | 成功切換重複播放模式: ${(Mode = Mode
                ? Mode == 2
                    ? '<:loop2:1265560938417754213>整個清單'
                    : '<:looponce:1265560956193210399>單曲'
                : '<:xmark:1265562550947545089>')}`,
            ephemeral: true
        })
    }
}
