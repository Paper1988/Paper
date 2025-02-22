const { YouTubePlugin } = require('@distube/youtube')
const { ChatInputCommandInteraction, Client, EmbedBuilder, MessageFlags } = require('discord.js')

module.exports = {
    subCommand: 'music.play',
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        await interaction.reply({
            content: '<a:discord1792loading:1212016238839070791> | 處理請求中...'
        })
        const { options, channel, member } = interaction
        const VoiceChannel = member.voice.channel

        const position = options.getNumber('position', false) ?? undefined
        const skip = options.getBoolean('skip', false)

        const yt = new YouTubePlugin()

        const embed = new EmbedBuilder().setColor('Red').setTitle('發生錯誤').setTimestamp()

        if (!VoiceChannel)
            return await interaction.editReply({
                content: '<:warning:1265562532857380936> | 你必須待在語音頻道裡面才能使用音樂指令!',
                flags: MessageFlags.Ephemeral
            })

        if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
            return await interaction.editReply({
                content: `<:warning:1265562532857380936> | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`,
                flags: MessageFlags.Ephemeral
            })

        if (!VoiceChannel.joinable) {
            return await interaction.editReply({
                content: '',
                embeds: [
                    new EmbedBuilder()
                        .setTitle('拒絕請求')
                        .setDescription(
                            `<:warning:1265562532857380936> | 我沒有權限進入 <#${VoiceChannel.id}>!`
                        )
                        .setColor('Red')
                ],
                flags: MessageFlags.Ephemeral
            })
        }

        await client.distube.voices.join(VoiceChannel)

        const youtubeRegex = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/

        if (!youtubeRegex.test(options.getString('search'))) {
            if (options.getString('search').startsWith('https://')) {
                client.distube
                    .play(VoiceChannel, options.getString('search'), {
                        textChannel: channel,
                        member: member,
                        position,
                        skip
                    })
                    .then(() => interaction.deleteReply())
            } else {
                const results = await yt.search(options.getString('search'))

                client.distube
                    .play(VoiceChannel, results[0], {
                        textChannel: channel,
                        member: member,
                        position,
                        skip
                    })
                    .then(() => interaction.deleteReply())
                    .catch((err) =>
                        interaction
                            .editReply({
                                embeds: [
                                    embed.setDescription('<:warning:1265562532857380936> | ' + err)
                                ]
                            })
                            .then(() => setTimeout(() => interaction.deleteReply(), 15 * 1000))
                    )
            }
        } else {
            return await interaction
                .editReply({
                    content: '',
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setTitle('拒絕請求')
                            .setDescription(
                                '<:warning:1265562532857380936> | Discord禁止機器人播放來自Youtube的連結!\n> 我們支援Spotify、SoundCloud和關鍵字搜尋'
                            )
                    ]
                })
                .then((msg) => setTimeout(() => msg.delete(), 15 * 1000))
        }
    }
}
