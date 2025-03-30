const { StringSelectMenuInteraction, Client } = require('discord.js')

module.exports = {
    id: 'addSong',
    /**
     *
     * @param {StringSelectMenuInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const songUrl = interaction.values[0]

        await client.distube.play(interaction.member.voice.channel, songUrl, {
            textChannel: interaction.channel,
            member: interaction.member
        })

        await interaction.deleteReply()
    }
}
