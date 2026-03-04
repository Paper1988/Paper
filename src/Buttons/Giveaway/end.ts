import type { ButtonType } from '@/typings/component.js'
import {
    ActionRowBuilder,
    ButtonInteraction,
    LabelBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} from 'discord.js'

export default {
    id: 'giveaway-end',
    async execute(interaction: ButtonInteraction) {
        /* const endEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('<:stop:1265562218498363422> | 結束抽獎')
            .setDescription('請輸入要結束的抽獎 ID')
            .setTimestamp() */

        const modal = new ModalBuilder().setCustomId('end-giveaway-modal').setTitle('結束抽獎')

        const giveawayIdInput = new TextInputBuilder()
            .setCustomId('giveawayId')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

        const label = new LabelBuilder().setTextInputComponent(giveawayIdInput).setLabel('抽獎 ID')

        modal.addLabelComponents(label)

        await interaction.showModal(modal)
    }
} satisfies ButtonType
