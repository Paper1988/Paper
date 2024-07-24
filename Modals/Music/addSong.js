const { ModalSubmitInteraction, Client } = require('discord.js')
const { SearchResultType, YouTubePlugin } = require('@distube/youtube')

module.exports = {
    id: 'addSong',
    /**
     * @param {ModalSubmitInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const { member } = interaction
        const VoiceChannel = member.voice.channel
        const songName = interaction.fields.getTextInputValue('songName')

        const youtubeRegex = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/

        const ytPlugin = new YouTubePlugin()

        if (!youtubeRegex.test(options.getString('query'))) {
            const results = await ytPlugin.search(songName, {
                type: SearchResultType.VIDEO
            })

            client.distube.play(VoiceChannel, results[0], { member })

            await interaction.reply({
                content: `<:plus_988409343743496232:1202215484318302208> | 成功添加新歌曲: ${results[0]}`,
                ephemeral: true
            })
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
                .then((msg) => setTimeout(() => msg.delete(), 15 * 1000))
        }
    }
}
