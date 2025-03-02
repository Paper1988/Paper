const { ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType } = require('discord.js')

module.exports = {
    id: 'giveaway-create',
    async execute(interaction, client) {
        const row = new ActionRowBuilder().addComponents(
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
}
