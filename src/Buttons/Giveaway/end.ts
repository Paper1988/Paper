import type { ButtonType } from '@/typings/component'
import {
    ActionRowBuilder,
    ButtonInteraction,
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
            .setLabel('抽獎 ID')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

        modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(giveawayIdInput))

        await interaction.showModal(modal)
    }
} satisfies ButtonType
