import { ButtonInteraction } from 'discord.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { buildHelpCommand } from '@/Systems/UI/HelpRenderer.js'

export default {
    id: 'helpCommand',
    async execute(interaction: ButtonInteraction, client: PaperClient, commandName: string) {
        const response = buildHelpCommand(client, commandName)
        await interaction.update({ components: response.components })
    },
}
