import { ButtonInteraction } from 'discord.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { buildHelpHome } from '@/Systems/UI/HelpRenderer.js'

export default {
    id: 'helpBack',
    async execute(interaction: ButtonInteraction, client: PaperClient) {
        if (interaction.customId !== 'helpBack') return
        const response = buildHelpHome(client, interaction.locale)
        await interaction.update({ components: response.components })
    },
}
