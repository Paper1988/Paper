const { ModalSubmitInteraction, Client, EmbedBuilder } = require('discord.js')
const { YouTubePlugin } = require('@distube/youtube')

module.exports = {
    id: 'addSong',
    /**
     * @param {ModalSubmitInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        await interaction.deferReply({ fetchReply: true })
        const { member } = interaction
        const VoiceChannel = member.voice.channel
        const songName = interaction.fields.getTextInputValue('songName')

        const youtubeRegex = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/

        const ytPlugin = new YouTubePlugin()

        if (!youtubeRegex.test(songName)) {
            const results = await ytPlugin.search(songName)

            client.distube.play(VoiceChannel, results[0], { member })

            return await interaction.editReply({
                content: `<:plus_988409343743496232:1202215484318302208> | 成功添加新歌曲: ${results[0]}`
            })
        } else {
            return await interaction
                .editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setTitle('拒絕請求')
                            .setDescription(
                                '<:warning_908958943466893323:1201844340276862976> | Discord禁止機器人播放來自Youtube的連結!\n> 我們支援Spotify、SoundCloud和關鍵字搜尋'
                            )
                    ]
                })
                .then(() => setTimeout(async () => await interaction.deleteReply(), 15 * 1000))
        }
    }
}
