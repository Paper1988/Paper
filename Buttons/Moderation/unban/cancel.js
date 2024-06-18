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
            .setDescription(`<:outage_868122243845206087:1202112862990897172> | 動作已取消`)
            .setFooter({
                text: '你可以關閉這個視窗了'
            })

        await interaction.update({
            embeds: [canceledEmbed],
            components: []
        })
    }
}
