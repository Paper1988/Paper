const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js')
const GiveawayNotification = require('../../../Structures/Schemas/GiveawayNotification')

module.exports = {
    id: 'notify-reminder',
    async execute(interaction, client) {
        let settings = await GiveawayNotification.findOne({
            guildId: interaction.guildId,
            userId: interaction.user.id
        })

        if (!settings) {
            settings = new GiveawayNotification({
                guildId: interaction.guildId,
                userId: interaction.user.id
            })
        }

        settings.notifyReminder = !settings.notifyReminder
        await settings.save()

        const settingsEmbed = new EmbedBuilder()
            .setTitle('<:reminder:1265561686358753280> | 抽獎通知設定')
            .setDescription('選擇你想要接收的通知類型')
            .setColor('Blue')
            .addFields({
                name: '目前設定',
                value: `
                        ${settings.notifyStart ? '<:correct:1265560254708711467>' : '<:xmark:1265562550947545089>'} 新抽獎開始通知
                        ${settings.notifyEnd ? '<:correct:1265560254708711467>' : '<:xmark:1265562550947545089>'} 抽獎結束通知
                        ${settings.notifyWin ? '<:correct:1265560254708711467>' : '<:xmark:1265562550947545089>'} 中獎通知
                        ${settings.notifyReminder ? '<:correct:1265560254708711467>' : '<:xmark:1265562550947545089>'} 結束提醒通知
                        
                        <:mail:1320298639293415434> 通知方式: ${settings.dmNotification ? '私人訊息' : '伺服器頻道'}
                    `
            })

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('notify-start')
                .setLabel('開始通知')
                .setStyle(settings.notifyStart ? ButtonStyle.Success : ButtonStyle.Secondary)
                .setEmoji('<:correct:1265560254708711467>'),
            new ButtonBuilder()
                .setCustomId('notify-end')
                .setLabel('結束通知')
                .setStyle(settings.notifyEnd ? ButtonStyle.Success : ButtonStyle.Secondary)
                .setEmoji('<:stop:1265562532857380936>'),
            new ButtonBuilder()
                .setCustomId('notify-win')
                .setLabel('中獎通知')
                .setStyle(settings.notifyWin ? ButtonStyle.Success : ButtonStyle.Secondary)
                .setEmoji('<:mail:1320298639293415434>'),
            new ButtonBuilder()
                .setCustomId('notify-reminder')
                .setLabel('提醒通知')
                .setStyle(settings.notifyReminder ? ButtonStyle.Success : ButtonStyle.Secondary)
                .setEmoji('<:reminder:1265561686358753280>'),
            new ButtonBuilder()
                .setCustomId('notify-method')
                .setLabel(settings.dmNotification ? 'DM通知' : '頻道通知')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('<:mail:1320298639293415434>')
        )

        await interaction.update({
            embeds: [settingsEmbed],
            components: [buttons]
        })
    }
}
