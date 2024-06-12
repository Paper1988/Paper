const {
    ChatInputCommandInteraction,
    Client,
    EmbedBuilder,
    PermissionFlagsBits
} = require('discord.js')

const { YouTubePlugin, SearchResultType } = require('@distube/youtube')

module.exports = {
    subCommand: 'music.play',
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const { options, channel, member } = interaction
        const VoiceChannel = member.voice.channel

        const position = options.getNumber('position', false) ?? undefined
        const skip = options.getBoolean('skip', false)

        const ytPlugin = new YouTubePlugin()

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
        if (!VoiceChannel.permissionsFor(client.user).has(PermissionFlagsBits.Connect)) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('拒絕請求')
                        .setDescription(
                            `<:warning_908958943466893323:1201844340276862976> | 我沒有權限進入 <#${VoiceChannel.id}> !`
                        )
                        .setColor('Red')
                ],
                ephemeral: true
            })
        }

        const youtubeRegex = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/

        if (!youtubeRegex.test(options.getString('query'))) {
            if (options.getString('query').startsWith('https://')) {
                client.distube
                    .play(VoiceChannel, options.getString('query'), {
                        textChannel: channel,
                        member: member,
                        position,
                        skip
                    })
                    .then(() => {
                        const queue = client.distube.getQueue(interaction.guild)
                        queue.filters.add('speed_1')
                    })
            } else {
                const results = await ytPlugin.search(options.getString('query'), {
                    type: SearchResultType.VIDEO
                })

                client.distube
                    .play(VoiceChannel, results[0], {
                        textChannel: channel,
                        member: member,
                        position,
                        skip
                    })
                    .then(() => {
                        const queue = client.distube.getQueue(interaction.guild)
                        queue.filters.add('speed_1')
                    })
            }
        } else {
            return await interaction
                .reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setTitle('拒絕請求')
                            .setDescription(
                                '<:warning_908958943466893323:1201844340276862976> | Discord禁止機器人播放來自Youtube的連結!\n> 我們支援Spotify、SoundCloud和關鍵字搜尋'
                            )
                    ]
                })
                .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
        }
        return await interaction
            .reply({ content: '<a:discord1792loading:1212016238839070791> | 處理請求中...' })
            .then((m) => {
                setTimeout(() => {
                    m.delete()
                }, 10 * 1000)
            })
            .catch((e) => {
                channel
                    .send({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Red')
                                .setDescription(
                                    `<:outage_868122243845206087:1202112862990897172> | 發生錯誤: ${e
                                        .toString()
                                        .slice(0, 1974)}`
                                )
                        ]
                    })
                    .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
            })
    }
}
