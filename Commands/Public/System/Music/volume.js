const { ChatInputCommandInteraction, Client } = require('discord.js')
const MusicDB = require('../../../../Structures/Schemas/MusicDB')
const { updateMusicPlayerStatus } = require('../../../../Systems/Music')

module.exports = {
    subCommand: 'music.volume',
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const { options, member, guild } = interaction
        const VoiceChannel = member.voice.channel
        const Volume = options.getNumber('percent')
        const queue = await client.distube.getQueue(VoiceChannel)

        if (!VoiceChannel)
            return interaction.reply({
                content:
                    '<:warning_908958943466893323:1201844340276862976> | 你必須待在語音頻道裡面才能使用音樂指令!',
                ephemeral: true
            })
        if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
            return interaction.reply({
                content: `<:warning_908958943466893323:1201844340276862976> | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`,
                ephemeral: true
            })

        if (Volume > 200 || Volume < 0)
            return interaction.reply({
                content:
                    '<:outage_868122243845206087:1202112862990897172> | 你必須指定0到200之間的數字!'
            })

        if (!queue)
            return interaction.reply({
                content:
                    '<:outage_868122243845206087:1202112862990897172> | 找不到歌曲或該歌曲已經播放完畢!',
                ephemeral: true
            })

        client.distube.setVolume(VoiceChannel, Volume)

        updateMusicPlayerStatus(queue)

        await MusicDB.findOneAndUpdate(
            { GuildID: guild.id },
            { volume: Volume },
            { new: true, upsert: true }
        )
        if (Volume < 50 && Volume > 0)
            return await interaction
                .reply({
                    content: `<:speaker_low_860133546278387763:1201844302725255178> | 成功設置音量: \`${Volume}%\``
                })
                .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
        else if (Volume >= 50)
            return await interaction
                .reply({
                    content: `<:speaker_860133545544908802:1201844300099354644> | 成功設置音量: \`${Volume}%\``
                })
                .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
    }
}
