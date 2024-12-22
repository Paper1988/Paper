const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const GiveawayNotification = require('../../../../Structures/Schemas/GiveawayNotification');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveawaynotify')
        .setDescription('設定抽獎通知'),

    async execute(interaction) {
        const userSettings = await GiveawayNotification.findOne({
            guildId: interaction.guildId,
            userId: interaction.user.id
        }) || new GiveawayNotification({
            guildId: interaction.guildId,
            userId: interaction.user.id
        });

        const settingsEmbed = new EmbedBuilder()
            .setTitle('🔔 抽獎通知設定')
            .setDescription('選擇你想要接收的通知類型')
            .setColor('Blue')
            .addFields(
                { 
                    name: '目前設定',
                    value: `
                        ${userSettings.notifyStart ? '✅' : '❌'} 新抽獎開始通知
                        ${userSettings.notifyEnd ? '✅' : '❌'} 抽獎結束通知
                        ${userSettings.notifyWin ? '✅' : '❌'} 中獎通知
                        ${userSettings.notifyReminder ? '✅' : '❌'} 結束提醒通知
                        
                        📨 通知方式: ${userSettings.dmNotification ? '私人訊息' : '伺服器頻道'}
                    `
                }
            );

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('notify-start')
                    .setLabel('開始通知')
                    .setStyle(userSettings.notifyStart ? ButtonStyle.Success : ButtonStyle.Secondary)
                    .setEmoji('🎉'),
                new ButtonBuilder()
                    .setCustomId('notify-end')
                    .setLabel('結束通知')
                    .setStyle(userSettings.notifyEnd ? ButtonStyle.Success : ButtonStyle.Secondary)
                    .setEmoji('🏁'),
                new ButtonBuilder()
                    .setCustomId('notify-win')
                    .setLabel('中獎通知')
                    .setStyle(userSettings.notifyWin ? ButtonStyle.Success : ButtonStyle.Secondary)
                    .setEmoji('🎯'),
                new ButtonBuilder()
                    .setCustomId('notify-reminder')
                    .setLabel('提醒通知')
                    .setStyle(userSettings.notifyReminder ? ButtonStyle.Success : ButtonStyle.Secondary)
                    .setEmoji('⏰'),
                new ButtonBuilder()
                    .setCustomId('notify-method')
                    .setLabel(userSettings.dmNotification ? 'DM通知' : '頻道通知')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📨')
            );

        await interaction.reply({
            embeds: [settingsEmbed],
            components: [buttons],
            ephemeral: true
        });
    }
}; 