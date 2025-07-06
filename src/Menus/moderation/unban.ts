import type { PaperClient } from '@/classes/PaperClient.js'
import type { MenuType } from '@/typings/component.js'
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    type AnySelectMenuInteraction
} from 'discord.js'

export default {
    id: 'unban:selectMenu',
    async execute(interaction: AnySelectMenuInteraction, client: PaperClient) {
        if (interaction.isStringSelectMenu() && interaction.customId == 'unban:selectMenu') {
            const member = await client.users.fetch(interaction.values[0]!)

            const confirmationEmbed = new EmbedBuilder()
                .setColor('Blue')
                .setDescription(
                    `<:question_860133545905225768:1202218555844853760> | 你確定要解除封鎖 ${member} 嗎?`
                )
                .setFooter({
                    text: client.user!.username,
                    iconURL: client.user!.displayAvatarURL()
                })

            const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId(`unbanConfirm/${member.id}`)
                    .setLabel('確認')
                    .setEmoji('<:correct_859388130411282442:1201843648229294121>')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('unbanCancel')
                    .setLabel('取消')
                    .setEmoji('<:xmark_988409378161954866:1201844342029815848>')
                    .setStyle(ButtonStyle.Secondary)
            )

            await interaction.update({
                embeds: [confirmationEmbed],
                components: [buttons]
            })
        }
    }
} satisfies MenuType
