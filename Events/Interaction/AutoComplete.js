const { AutocompleteInteraction } = require('discord.js')

module.exports = {
    name: 'interactionCreate',
    /**
     * @param {AutocompleteInteraction} interaction
     */
    async execute(interaction) {
        if (!interaction.isAutocomplete()) return

        // 假設您的指令名稱和子指令名稱是以 '.' 分隔
        const commandName = interaction.commandName

        const command = await interaction.client.commands.get(commandName)

        if (!command) {
            return console.log(`[Autocomplete] 找不到指令 ${commandName}`)
        }

        if (command.autocomplete) {
            try {
                await command.autocomplete(interaction, interaction.client)
            } catch (error) {
                return console.log('[Autocomplete] ' + error)
            }
        } else {
            return console.warn(
                `[Autocomplete] 指令 ${interaction.commandName} 沒有實現 autocomplete 方法。`
            )
        }
    }
}
