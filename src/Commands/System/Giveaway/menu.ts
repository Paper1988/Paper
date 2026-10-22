import type { SubCommandType } from '@/typings/command.js'
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    ContainerBuilder,
    MessageFlags,
    PermissionsBitField,
    TextDisplayBuilder
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

        const panel = new ContainerBuilder()
            .setAccentColor(ACCENT_COLOR)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent([
                    '# 抽獎管理',
                    '建立活動、查看進度，或管理已發布的抽獎。',
                    '',
                    '### 建立活動',
                    '設定獎品、結束時間與參加條件。',
                    '',
                    '### 活動管理',
                    '查看進行中的抽獎、統計資料，或手動結束活動。',
                    '',
                    '-# Paper Giveaway · 此管理介面僅自己可見'
                ].join('\n'))
            )

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
            components: [panel, actions],
            flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
        })
    }
} satisfies SubCommandType
