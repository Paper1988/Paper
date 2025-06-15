import type { ButtonType } from '@/typings/component'
import type { ButtonInteraction } from 'discord.js'
import { ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType } from 'discord.js'

export default {
    id: 'giveaway-create',
    async execute(interaction: ButtonInteraction) {
        const row = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
            new ChannelSelectMenuBuilder()
                .setCustomId('giveaway-channel-select')
                .setPlaceholder('選擇要創建抽獎的頻道')
                .setMinValues(1)
                .setMaxValues(1)
                .addChannelTypes(ChannelType.GuildText)
        )

        await interaction.reply({
            content: `<:question:1265561586693701703> | 請選擇要創建抽獎的頻道：`,
            components: [row]
        })
    }
} satisfies ButtonType
