const Embed = require('../../Systems/MusicEmbed')
const MusicDB = require('../../Structures/Schemas/MusicDB')

module.exports = {
    id: 'volumeUp',
    async execute(interaction, client) {
        // To access an id / value from a button you MUST INCLUDE `client` AND `args` and in the same order as shown
        const { member, guild } = interaction
        const VoiceChannel = member.voice.channel
        const { message } = require('../../Events/Distube/DistubeEvents')

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

        const queue = client.distube.getQueue(VoiceChannel)
        if (!queue)
            return interaction.reply({
                content:
                    '<:outage_868122243845206087:1202112862990897172> | 找不到歌曲或該歌曲已經播放完畢!',
                ephemeral: true
            })

        const Data = await MusicDB.findOne({ GuildID: queue.id })
        const message = await queue.textChannel.messages.fetch(Data.message)

        const song = queue.songs[0]
        client.distube.setVolume(VoiceChannel, queue.volume + 10)
        message.edit({ embeds: [Embed(queue, song)] })
        await MusicDB.findOneAndUpdate(
            { GuildID: guild.id },
            { volume: queue.volume },
            { new: true, upsert: true }
        )
        return interaction.reply({
            content: `<:speaker_860133545544908802:1201844300099354644> | 成功設置音量: \`${queue.volume}%\``,
            ephemeral: true
        })
    }
}
