const { EmbedBuilder, ButtonInteraction } = require('discord.js')

module.exports = {
    id: 'unban:cancel',
    /**
     *
     * @param {ButtonInteraction} interaction
     */
    async execute(interaction) {
        const canceledEmbed = new EmbedBuilder()
            .setColor('Blue')
            .setDescription(`<:outage:1265561329528471613> | 動作已取消`)

        await interaction.update({
            embeds: [canceledEmbed],
            components: []
        })
    }
}
