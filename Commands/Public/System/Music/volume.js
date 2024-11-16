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
            return await interaction.reply({
                content: '<:warning:1265562532857380936> | 你必須待在語音頻道裡面才能使用音樂指令!',
                ephemeral: true
            })
        if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
            return await interaction.reply({
                content: `<:warning:1265562532857380936> | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`,
                ephemeral: true
            })

        if (Volume > 200 || Volume < 0)
            return await interaction.reply({
                content: '<:outage:1265561329528471613> | 你必須指定0到200之間的數字!'
            })

        if (!queue)
            return await interaction.reply({
                content: '<:outage:1265561329528471613> | 找不到歌曲或該歌曲已經播放完畢!',
                ephemeral: true
            })

        await client.distube.setVolume(VoiceChannel, Volume)

        await updateMusicPlayerStatus(queue)

        await MusicDB.findOneAndUpdate(
            { GuildID: guild.id },
            { volume: Volume },
            { new: true, upsert: true }
        )
        if (Volume < 50 && Volume > 0)
            return await interaction
                .reply({
                    content: `<:speaker_low:1265561976663310386> | 成功設定音量: \`${Volume}%\``
                })
                .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
        else if (Volume == 0)
            return await interaction
                .reply({
                    content: `<:speaker_mute:1265561998192807936> | 成功設定音量: \`0%\``
                })
                .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
        else if (Volume >= 50)
            return await interaction
                .reply({
                    content: `<:speaker:1265561928533807146> | 成功設定音量: \`${Volume}%\``
                })
                .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
    }
}
