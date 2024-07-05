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

        const ytPlugin = new YouTubePlugin()

        const results = await ytPlugin.search(songName, {
            type: SearchResultType.VIDEO
        })

        client.distube.play(VoiceChannel, results[0], { member })

        await interaction.reply({
            content: `<:plus_988409343743496232:1202215484318302208> | 成功添加新歌曲: ${songName}`,
            ephemeral: true
        })
    }
}
