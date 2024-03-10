const { ChatInputCommandInteraction, Client, EmbedBuilder } = require('discord.js')

module.exports = {
    subCommand: 'music.play',
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const { options, channel, member } = interaction
        const VoiceChannel = member.voice.channel

        if (!VoiceChannel)
            return interaction.reply({
                content:
                    '<:warning_908958943466893323:1201844340276862976> | 你必須待在一個語音頻道裡面才能使用音樂指令!',
                ephemeral: true
            })
        if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
            return interaction.reply({
                content: `<:warning_908958943466893323:1201844340276862976> | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`,
                ephemeral: true
            })
        if (!VoiceChannel.permissionsFor(client.user).has('Connect')) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('拒絕請求')
                        .setDescription(
                            '<:warning_908958943466893323:1201844340276862976> | 我沒有權限進入你的頻道!'
                        )
                        .setColor('Red')
                ],
                ephemeral: true
            })
        }

        const youtubeRegex = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/

        if (!youtubeRegex.test(options.getString('query'))) {
            client.distube.play(VoiceChannel, options.getString('query'), {
                textChannel: channel,
                member: member
            })
        } else {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setTitle('拒絕請求')
                        .setDescription(
                            '<:warning_908958943466893323:1201844340276862976> | Discord禁止機器人播放來自Youtube的連結!\n> 我們支援Spotify、SoundCloud和關鍵字搜尋'
                        )
                ]
            })
        }
        return await interaction
            .reply({ content: '<:queue_861852633240961024:1202112866069520385> | 接受請求' })
            .then((m) => {
                setTimeout(() => {
                    m.delete()
                }, 10 * 1000)
            })
    }
}
