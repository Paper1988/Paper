import type { SubCommandType } from '@/typings/command'
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    MessageFlags,
    PermissionsBitField
} from 'discord.js'

export default {
    subCommand: 'giveaway.menu',
    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.memberPermissions!.has(PermissionsBitField.Flags.ManageGuild)) {
            return interaction.reply({
                content:
                    '<:warning:1265562532857380936> | 你需要管理伺服器的權限才能使用抽獎系統！',
                flags: MessageFlags.Ephemeral
            })
        }

        const giveawayEmbed = new EmbedBuilder()
            .setColor('Purple')
            .setTitle('<:gift:1265560472409735181> | 抽獎系統')
            .setDescription('請選擇要執行的操作：')
            .setTimestamp()

        const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('giveaway-create')
                .setLabel('創建抽獎')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('<:tada:1265562251981750272>'),
            new ButtonBuilder()
                .setCustomId('giveaway-list')
                .setLabel('查看列表')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('<:list:1265560873876062340>'),
            new ButtonBuilder()
                .setCustomId('giveaway-stats')
                .setLabel('統計資訊')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('<:richpresent:1265561713969987676>'),
            new ButtonBuilder()
                .setCustomId('giveaway-end')
                .setLabel('結束抽獎')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('<:stop:1265562218498363422>')
        )

        await interaction.reply({
            embeds: [giveawayEmbed],
            components: [buttons]
        })
    }
} as SubCommandType
