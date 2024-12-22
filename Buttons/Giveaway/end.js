const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    id: 'giveaway-end',
    async execute(interaction) {
        const endEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('<:stop:1265562218498363422> | 結束抽獎')
            .setDescription('請輸入要結束的抽獎 ID')
            .setTimestamp();

        const modal = new ModalBuilder()
            .setCustomId('end-giveaway-modal')
            .setTitle('結束抽獎');

        const giveawayIdInput = new TextInputBuilder()
            .setCustomId('giveawayId')
            .setLabel('抽獎 ID')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const firstRow = new ActionRowBuilder().addComponents(giveawayIdInput);
        modal.addComponents(firstRow);

        await interaction.showModal(modal);
    }
}; 