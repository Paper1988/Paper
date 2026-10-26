import { getManagedChannel } from '@/Systems/TempVoice.js'
import type { ButtonType } from '@/typings/component.js'
import { ActionRowBuilder, ButtonInteraction, MessageFlags, UserSelectMenuBuilder } from 'discord.js'

export default {
    id: 'tvKick',
    async execute(interaction: ButtonInteraction) {
        const managed = await getManagedChannel(interaction)
        if (!managed) return

        const select = new UserSelectMenuBuilder()
            .setCustomId('tvKick')
            .setPlaceholder('選擇要踢出的成員')
            .setMaxValues(1)

        await interaction.reply({
            components: [new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(select)],
            flags: MessageFlags.Ephemeral
        })
    }
} satisfies ButtonType
