import emoji from '@/libs/emoji/emoji'
import GiveawayNotification from '@/Structures/Schemas/GiveawayNotification'
import type { ButtonType } from '@/typings/component'
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    EmbedBuilder
} from 'discord.js'

export default {
    id: 'notify-end',
    async execute(interaction: ButtonInteraction) {
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

        settings.notifyEnd = !settings.notifyEnd
        await settings.save()

        const settingsEmbed = new EmbedBuilder()
            .setTitle('<:reminder:1265561686358753280> | 抽獎通知設定')
            .setDescription('選擇你想要接收的通知類型')
            .setColor('Blue')
            .addFields({
                name: '目前設定',
                value: `
                        ${settings.notifyStart ? emoji.correct : emoji.xmark} 新抽獎開始通知
                        ${settings.notifyEnd ? emoji.correct : emoji.xmark} 抽獎結束通知
                        ${settings.notifyWin ? emoji.correct : emoji.xmark} 中獎通知
                        ${settings.notifyReminder ? emoji.correct : emoji.xmark} 結束提醒通知
                    `
            })

        const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('notify-start')
                .setLabel('開始通知')
                .setStyle(settings.notifyStart ? ButtonStyle.Success : ButtonStyle.Secondary)
                .setEmoji(emoji.correct),
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
                .setEmoji('<:reminder:1265561686358753280>')
        )

        await interaction.update({
            embeds: [settingsEmbed],
            components: [buttons]
        })
    }
} satisfies ButtonType
