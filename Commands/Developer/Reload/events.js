const { ChatInputCommandInteraction, Client, MessageFlags } = require('discord.js')
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
            content: '<:correct:1265560254708711467> | 成功載入Events!',
            flags: MessageFlags.Ephemeral
        })
    }
}
