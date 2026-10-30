import type { ButtonType } from '@/typings/component.js'
import { ButtonInteraction, EmbedBuilder, MessageFlags } from 'discord.js'

export default {
    id: 'unbanCancel',
    async execute(interaction: ButtonInteraction) {
        const [, requesterId] = interaction.customId.split('/')

        if (requesterId !== interaction.user.id) {
            return interaction.reply({
                content: '這個操作視窗不屬於你。',
                flags: MessageFlags.Ephemeral
            })
        }

        const canceledEmbed = new EmbedBuilder()
            .setColor('Blue')
            .setDescription('<:outage:1265561329528471613> | 動作已取消')

        await interaction.update({
            embeds: [canceledEmbed],
            components: []
        })
    }
} satisfies ButtonType
