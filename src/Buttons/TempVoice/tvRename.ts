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
    id: 'tvRename',
    async execute(interaction: ButtonInteraction) {
        const managed = await getManagedChannel(interaction)
        if (!managed) return

        const modal = new ModalBuilder()
            .setCustomId('tvRename')
            .setTitle('修改頻道名稱')
            .addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                    new TextInputBuilder()
                        .setCustomId('name')
                        .setLabel('新名稱')
                        .setStyle(TextInputStyle.Short)
                        .setMaxLength(100)
                        .setValue(managed.channel.name)
                        .setRequired(true)
                )
            )

        await interaction.showModal(modal)
    }
} satisfies ButtonType
