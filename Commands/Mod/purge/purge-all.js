const { ChatInputCommandInteraction } = require('discord.js')
const { results } = require('../../../Systems/PurgeFunction')

module.exports = {
    subCommand: 'purge.all',
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        let amount = interaction.options.getInteger('count')
        if (amount > 100) amount = 100
        const fetch = await interaction.channel.messages.fetch({ limit: amount })

        let deletedMessages
        deletedMessages = await interaction.channel.bulkDelete(fetch, true)
        results(deletedMessages, interaction)
    }
}
