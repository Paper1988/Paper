const {
    ModalSubmitInteraction,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require('discord.js')
const { YouTubePlugin } = require('@distube/youtube')

module.exports = {
    id: 'addSong',
    /**
     * @param {ModalSubmitInteraction} interaction
     */
    async execute(interaction) {
        const songName = interaction.fields.getTextInputValue('songName')

        const select = new StringSelectMenuBuilder()
            .setCustomId('addSong')
            .setPlaceholder('請選擇歌曲')

        const yt = new YouTubePlugin()

        const Menu = new ActionRowBuilder().addComponents(select)

        await yt.search(songName, { limit: 20 }).then((results) => {
            select.addOptions(
                results.map((song, id) => ({
                    label: song.name.toString(),
                    description: `作者: ${song.uploader.name}`,
                    value: song.url.toString()
                }))
            )
        })

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('歌曲搜尋')
                    .setDescription('> 請選擇一首歌曲')
                    .setColor('White')
            ],
            components: [Menu]
        })
    }
}
