import type { ButtonType } from '@/typings/component'
import { ButtonInteraction, EmbedBuilder } from 'discord.js'

export default {
    id: 'unbanCancel',
    async execute(interaction: ButtonInteraction) {
        const canceledEmbed = new EmbedBuilder()
            .setColor('Blue')
            .setDescription('<:outage:1265561329528471613> | 動作已取消')

        await interaction.update({
            embeds: [canceledEmbed],
            components: []
        })
    }
} satisfies ButtonType
