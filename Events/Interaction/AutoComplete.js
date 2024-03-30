const { AutocompleteInteraction } = require('discord.js')

module.exports = {
    name: 'interactionCreate',
    /**
     * @param {AutocompleteInteraction} interaction
     */
    async execute(interaction) {
        if (!interaction.isAutocomplete()) return

        // 假設您的指令名稱和子指令名稱是以 '.' 分隔
        const [commandName, subCommandName] = interaction.commandName.split('.')

        const command = await interaction.client.commands.get(commandName)

        if (!command) {
            console.log(`No command matching ${commandName} was found.`)
            return
        }

        // 如果存在子指令，並且該子指令有 autocomplete 方法
        if (subCommandName && typeof command[subCommandName]?.autocomplete === 'function') {
            try {
                await command[subCommandName].autocomplete(interaction, interaction.client)
            } catch (error) {
                console.log(error)
            }
        } else if (typeof command.autocomplete === 'function') {
            // 如果沒有子指令，但指令本身有 autocomplete 方法
            try {
                await command.autocomplete(interaction, interaction.client)
            } catch (error) {
                console.log(error)
            }
        } else {
            console.warn(`指令 ${interaction.commandName} 沒有實現 autocomplete 方法。`)
        }
    }
}
