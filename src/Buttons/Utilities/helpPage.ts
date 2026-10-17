import { ButtonInteraction } from 'discord.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { buildHelpPage } from '@/Systems/UI/HelpRenderer.js'

export default {
    id: 'helpPage',
    async execute(interaction: ButtonInteraction, client: PaperClient, args: string[]) {
        const [category, page] = args
        if (!category || page === undefined) return
        const response = buildHelpPage(client, category, page, interaction.locale)
        await interaction.update({ components: response.components })
    },
}
