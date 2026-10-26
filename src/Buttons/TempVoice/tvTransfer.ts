import { getManagedChannel } from '@/Systems/TempVoice.js'
import type { ButtonType } from '@/typings/component.js'
import { ActionRowBuilder, ButtonInteraction, MessageFlags, UserSelectMenuBuilder } from 'discord.js'

export default {
    id: 'tvTransfer',
    async execute(interaction: ButtonInteraction) {
        const managed = await getManagedChannel(interaction)
        if (!managed) return

        const select = new UserSelectMenuBuilder()
            .setCustomId('tvTransfer')
            .setPlaceholder('選擇要轉移的成員')
            .setMaxValues(1)

        await interaction.reply({
            components: [new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(select)],
            flags: MessageFlags.Ephemeral
        })
    }
} satisfies ButtonType
