const { ChatInputCommandInteraction, Client } = require('discord.js')

module.exports = {
    subCommand: 'music.seek',
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const { options, member } = interaction
        const VoiceChannel = member.voice.channel

        if (!VoiceChannel)
            return interaction.reply({
                content: '<:warning:1265562532857380936> | 你必須待在語音頻道裡面才能使用音樂指令!',
                ephemeral: true
            })
        if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
            return interaction.reply({
                content: `<:warning:1265562532857380936> | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`,
                ephemeral: true
            })

        const queue = await client.distube.getQueue(VoiceChannel)
        const Time = options.getNumber('time')

        if (!queue)
            return interaction.reply({
                content: '<:outage:1265561329528471613> | 找不到歌曲或該歌曲已經播放完畢!',
                ephemeral: true
            })

        await queue.seek(Time)
        await interaction
            .reply({
                content: `<:rightarrow:1265561736593801276> | 成功跳到 **\`${Time}\`**`
            })
            .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
    }
}
