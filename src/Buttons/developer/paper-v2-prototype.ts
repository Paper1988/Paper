import { ButtonInteraction, MessageFlags } from 'discord.js'
import { PaperClient } from '@/Structures/classes/PaperClient.js'
import { interactionUtils } from '@/libs/utils/interactionUtils.js'

export default {
    id: 'paper-v2-prototype',
    async execute(interaction: ButtonInteraction, _client: PaperClient, args: string[]) {
        if (!interactionUtils.isDeveloper(interaction.user.id)) {
            await interactionUtils.sendDeveloperError(interaction)
            return
        }

        const action = args[0]
        const message = action === 'primary'
            ? 'Primary button interaction received.'
            : action === 'secondary'
                ? 'Secondary button interaction received.'
                : 'Unknown prototype action.'

        await interaction.reply({
            content: message,
            flags: MessageFlags.Ephemeral
        })
    }
}
