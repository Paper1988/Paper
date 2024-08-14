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
                content:
                    '<:warning_908958943466893323:1201844340276862976> | 你必須待在語音頻道裡面才能使用音樂按鈕!',
                ephemeral: true
            })
        if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
            return await interaction.editReply({
                content: `<:warning_908958943466893323:1201844340276862976> | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`,
                ephemeral: true
            })

        const queue = client.distube.getQueue(VoiceChannel)
        if (!queue)
            return await interaction.editReply({
                content:
                    '<:outage_868122243845206087:1202112862990897172> | 找不到歌曲或該歌曲已經播放完畢!',
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
            content: `<:loop_861852632893227029:1201843696031764490> | 成功切換重複播放模式: ${(Mode =
                Mode
                    ? Mode == 2
                        ? '<:loop_988409346637594744:1201843698976178246>整個清單'
                        : '<:looponce_988409348826992680:1201884069399363634>單曲'
                    : '<:xmark_988409378161954866:1201844342029815848>')}`,
            ephemeral: true
        })
    }
}
