const MusicDB = require('../../Structures/Schemas/MusicDB')
const { updateMusicPlayerStatus } = require('../../Systems/Music')
const { emojis } = require('../../libs/emoji/emoji')

module.exports = {
    id: 'loop',
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

        const queue = client.distube.getQueue(VoiceChannel)
        if (!queue)
            return await interaction
                .editReply({
                    content: `${emojis.outage} | 找不到歌曲或該歌曲已經播放完畢!`
                })
                .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))

        let Mode = await client.distube.setRepeatMode(queue)

        updateMusicPlayerStatus(queue)

        await MusicDB.findOneAndUpdate(
            { GuildID: guild.id },
            { repeatMode: (Mode = Mode ? (Mode == 2 ? 2 : 1) : 0) },
            { new: true, upsert: true }
        )

        return await interaction
            .editReply({
                content: `<:loop1:1265560917345570918> | 成功切換重複播放模式: ${(Mode = Mode
                    ? Mode == 2
                        ? '<:loop2:1265560938417754213>整個清單'
                        : '<:looponce:1265560956193210399>單曲'
                    : '<:xmark:1265562550947545089>')}`
            })
            .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
    }
}
