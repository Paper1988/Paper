import { ButtonInteraction } from 'discord.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { buildHelpCommand } from '@/Systems/UI/HelpRenderer.js'

export default {
    id: 'helpCommand',
    async execute(interaction: ButtonInteraction, client: PaperClient, args: string[]) {
        const commandName = args[0]
        if (!commandName) return
        const response = buildHelpCommand(client, commandName, interaction.locale)
        await interaction.update({ components: response.components })
    },
}
