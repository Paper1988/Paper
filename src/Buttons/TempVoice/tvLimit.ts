import { getManagedChannel } from '@/Systems/TempVoice.js'
import type { ButtonType } from '@/typings/component.js'
import {
    ActionRowBuilder,
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} from 'discord.js'

export default {
    id: 'tvLimit',
    async execute(interaction: ButtonInteraction) {
        const managed = await getManagedChannel(interaction)
        if (!managed) return

        const modal = new ModalBuilder()
            .setCustomId('tvLimit')
            .setTitle('設定人數上限')
            .addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                    new TextInputBuilder()
                        .setCustomId('limit')
                        .setLabel('人數上限（0 = 無限制，最多 99）')
                        .setStyle(TextInputStyle.Short)
                        .setMaxLength(2)
                        .setValue(String(managed.channel.userLimit))
                        .setRequired(true)
                )
            )

        await interaction.showModal(modal)
    }
} satisfies ButtonType
