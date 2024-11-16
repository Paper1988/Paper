const { ChatInputCommandInteraction, Client } = require('discord.js')

module.exports = {
    subCommand: 'music.jump',
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const { options, member } = interaction
        const VoiceChannel = member.voice.channel

        const position = options.getNumber('position')

        if (!VoiceChannel)
            return interaction.reply({
                content:
                    '<:warning:1265562532857380936> | 你必須待在一個語音頻道裡面才能使用音樂指令!',
                ephemeral: true
            })
        if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
            return interaction.reply({
                content: `<:warning:1265562532857380936> | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`,
                ephemeral: true
            })

        const queue = await client.distube.getQueue(VoiceChannel)

        if (!queue)
            return interaction.reply({
                content: '<:outage:1265561329528471613> | 找不到歌曲或該歌曲已經播放完畢!',
                ephemeral: true
            })

        await client.distube
            .jump(VoiceChannel, position)
            .then(async () => {
                return interaction
                    .reply({
                        content: `<:frontforward:1265560424510787584> | 成功跳至清單位置 \`${position}\` - ${queue.songs[position]}`
                    })
                    .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
            })
            .catch((err) =>
                interaction.reply({
                    content:
                        '<:warning:1265562532857380936> | 你提供的是無效的數字(可能是該位置沒有歌曲)!',
                    ephemeral: true
                })
            )
    }
}
