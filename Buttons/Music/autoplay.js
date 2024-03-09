const MusicDB = require('../../Structures/Schemas/MusicDB')
const Embed = require('../../Systems/MusicEmbed')

module.exports = {
    id: 'autoplay',
    async execute(interaction, client) {
        const { member, guild } = interaction
        const VoiceChannel = member.voice.channel
        const queue = client.distube.getQueue(VoiceChannel)
        const Data = await MusicDB.findOne({ GuildID: queue.id })
        const message = await queue.textChannel.messages.fetch(Data.message)

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

        if (!queue)
            return interaction.reply({
                content:
                    '<:outage_868122243845206087:1202112862990897172> | 找不到歌曲或該歌曲已經播放完畢!',
                ephemeral: true
            })

        let Mode = await queue.toggleAutoplay(VoiceChannel)
        message.edit({ embeds: [Embed(queue, queue.songs[0])] })

        await MusicDB.findOneAndUpdate(
            { GuildID: guild.id },
            { autoplayMode: Mode ? true : false },
            { new: true, upsert: true }
        )

        return interaction.reply({
            content: `<:loop_861852632893227029:1201843696031764490> | 成功切換自動播放模式: ${Mode ? '<:correct_859388130411282442:1201843648229294121>' : '<:xmark_988409378161954866:1201844342029815848>'}`,
            ephemeral: true
        })
    }
}
