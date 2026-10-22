import type { SubCommandType } from '@/typings/command.js'
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    MessageFlags,
    PermissionsBitField
} from 'discord.js'

const ACCENT_COLOR = 0xA3A3A3

export default {
    subCommand: 'giveaway.menu',
    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageGuild)) {
            return interaction.reply({
                content: '你需要「管理伺服器」權限才能管理抽獎活動。',
                flags: MessageFlags.Ephemeral
            })
        }

        const panel = new EmbedBuilder()
            .setColor(ACCENT_COLOR)
            .setTitle('抽獎管理')
            .setDescription(
                '建立活動、查看進度，或管理已發布的抽獎。\n\n' +
                '**建立活動**\n設定獎品、結束時間與參加條件。\n\n' +
                '**活動管理**\n查看進行中的抽獎、統計資料，或手動結束活動。'
            )
            .setFooter({ text: 'Paper Giveaway · 管理介面僅自己可見' })

        const actions = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('giveaway-create')
                .setLabel('建立抽獎')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🎁'),
            new ButtonBuilder()
                .setCustomId('giveaway-list')
                .setLabel('進行中的活動')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('giveaway-stats')
                .setLabel('活動統計')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('giveaway-end')
                .setLabel('結束活動')
                .setStyle(ButtonStyle.Danger)
        )

        await interaction.reply({
            embeds: [panel],
            components: [actions],
            flags: MessageFlags.Ephemeral
        })
    }
} satisfies SubCommandType
