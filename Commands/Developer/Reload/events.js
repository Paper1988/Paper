const { ChatInputCommandInteraction, Client } = require('discord.js')
const { loadEvents } = require('../../../Structures/Handlers/eventHandler')

module.exports = {
    subCommand: 'reload.events',
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        for (const [key, value] of client.events) await client.removeListener(`${key}`, value, true)
        loadEvents(client)
        await interaction.reply({
            content: '<:correct_859388130411282442:1201843648229294121> | 成功載入Events!',
            ephemeral: true
        })
    }
}
