import { StringSelectMenuInteraction } from 'discord.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { buildHelpSelection } from '@/Systems/UI/HelpRenderer.js'

export default {
    id: 'helpCategoryMenu',
    async execute(interaction: StringSelectMenuInteraction, client: PaperClient) {
        const response = buildHelpSelection(client, interaction.values[0] ?? '')
        await interaction.update({ components: response.components })
    },
}
