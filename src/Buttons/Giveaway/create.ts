import type { ButtonType } from '@/typings/component.js'
import {
    ActionRowBuilder,
    ButtonInteraction,
    ChannelSelectMenuBuilder,
    ChannelType,
    MessageFlags
} from 'discord.js'

export default {
    id: 'giveaway-create',
    async execute(interaction: ButtonInteraction) {
        const row = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
            new ChannelSelectMenuBuilder()
                .setCustomId('giveaway-channel-select')
                .setPlaceholder('選擇發布抽獎的文字頻道')
                .setMinValues(1)
                .setMaxValues(1)
                .addChannelTypes(ChannelType.GuildText)
        )

        await interaction.reply({
            content: '**建立抽獎**\n先選擇活動要發布在哪個文字頻道。接著填寫獎品、時間與參加條件。',
            components: [row],
            flags: MessageFlags.Ephemeral
        })
    }
} satisfies ButtonType
