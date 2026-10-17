import { ButtonInteraction } from 'discord.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { buildHelpPage } from '@/Systems/UI/HelpRenderer.js'

export default {
    id: 'helpPage',
    async execute(
        interaction: ButtonInteraction,
        client: PaperClient,
        category: string,
        page: string,
    ) {
        const response = buildHelpPage(client, category, page)
        await interaction.update({ components: response.components })
    },
}
