import GiveawayNotification from '@/Structures/Schemas/GiveawayNotification.js'
import type { SubCommandType } from '@/typings/command.js'
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    MessageFlags
} from 'discord.js'

export default {
    subCommand: 'giveaway.notification',
    async execute(interaction: ChatInputCommandInteraction) {
        const userSettings =
            (await GiveawayNotification.findOne({
                guildId: interaction.guildId,
                userId: interaction.user.id
            })) ||
            new GiveawayNotification({
                guildId: interaction.guildId,
                userId: interaction.user.id
            })

        const settingsEmbed = new EmbedBuilder()
            .setTitle('<:reminder:1265561686358753280> | 抽獎通知設定')
            .setDescription('選擇你想要接收的通知類型')
            .setColor('Blue')
            .addFields({
                name: '目前設定',
                value: `
                        新抽獎開始通知 ${userSettings.notifyStart ? '<:correct:1265560254708711467>' : '<:xmark:1265562550947545089>'}
                        抽獎結束通知 ${userSettings.notifyEnd ? '<:correct:1265560254708711467>' : '<:xmark:1265562550947545089>'}
                        中獎通知 ${userSettings.notifyWin ? '<:correct:1265560254708711467>' : '<:xmark:1265562550947545089>'}
                        結束提醒通知 ${userSettings.notifyReminder ? '<:correct:1265560254708711467>' : '<:xmark:1265562550947545089>'}
                    `
            })

        const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('notify-start')
                .setLabel('開始通知')
                .setStyle(userSettings.notifyStart ? ButtonStyle.Success : ButtonStyle.Secondary)
                .setEmoji('<:correct:1265560254708711467>'),
            new ButtonBuilder()
                .setCustomId('notify-end')
                .setLabel('結束通知')
                .setStyle(userSettings.notifyEnd ? ButtonStyle.Success : ButtonStyle.Secondary)
                .setEmoji('<:stop:1265562532857380936>'),
            new ButtonBuilder()
                .setCustomId('notify-win')
                .setLabel('中獎通知')
                .setStyle(userSettings.notifyWin ? ButtonStyle.Success : ButtonStyle.Secondary)
                .setEmoji('<:mail:1320298639293415434>'),
            new ButtonBuilder()
                .setCustomId('notify-reminder')
                .setLabel('提醒通知')
                .setStyle(userSettings.notifyReminder ? ButtonStyle.Success : ButtonStyle.Secondary)
                .setEmoji('<:reminder:1265561686358753280>')
        )

        await interaction.reply({
            embeds: [settingsEmbed],
            components: [buttons],
            flags: MessageFlags.Ephemeral
        })
    }
} as SubCommandType
