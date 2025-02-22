const { ChatInputCommandInteraction, Client, MessageFlags } = require('discord.js')
const { loadCommands } = require('../../../Structures/Handlers/commandHandler.js')

module.exports = {
    subCommand: 'reload.commands',
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        loadCommands(client)
        await interaction.reply({
            content: '<:correct:1265560254708711467> | 成功載入Commands!',
            flags: MessageFlags.Ephemeral
        })
    }
}
