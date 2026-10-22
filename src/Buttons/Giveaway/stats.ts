import GiveawayHistory from '@/Structures/Schemas/GiveawayHistory.js'
import GiveawayStats from '@/Structures/Schemas/GiveawayStats.js'
import type { ButtonType } from '@/typings/component.js'
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ContainerBuilder,
    MessageFlags,
    TextDisplayBuilder
} from 'discord.js'

const ACCENT_COLOR = 0xA3A3A3

async function createStatsPanel(guildId: string | null) {
    const stats = await GiveawayStats.findOne({ guildId })
    const recentHistory = await GiveawayHistory.find({ guildId })
        .sort({ createdAt: -1 })
        .limit(5)

    const lines = [
        '# 抽獎統計',
        '此伺服器的活動概況',
        '',
        '**總活動** · ' + (stats?.totalGiveaways ?? 0),
        '**進行中** · ' + (stats?.activeGiveaways ?? 0),
        '**參與人次** · ' + (stats?.totalParticipants ?? 0),
        '**獎品數** · ' + (stats?.totalPrizes ?? 0),
        '**得獎人次** · ' + (stats?.totalWinners ?? 0)
    ]

    if (stats?.mostActiveHoster?.userId) {
        lines.push('', '**最活躍主持人** · <@' + stats.mostActiveHoster.userId + '>（' + (stats.mostActiveHoster.count ?? 0) + ' 次）')
    }

    if (stats?.mostWonUser?.userId) {
        lines.push('**最多次得獎** · <@' + stats.mostWonUser.userId + '>（' + (stats.mostWonUser.count ?? 0) + ' 次）')
    }

    lines.push('', '## 最近結束的活動')
    if (recentHistory.length > 0) {
        for (const item of recentHistory) {
            const winners = item.winners.length
                ? item.winners.map((id) => '<@' + id + '>').join(', ')
                : '無得獎者'
            lines.push('**' + item.prize + '** · ' + winners)
        }
    } else {
        lines.push('尚無活動紀錄。')
    }

    lines.push('', '-# Paper Giveaway')
    return new ContainerBuilder()
        .setAccentColor(ACCENT_COLOR)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(lines.join('\n').slice(0, 4000)))
}

function createRefreshButton() {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('giveaway-refresh-stats')
            .setLabel('重新整理')
            .setEmoji('🔄')
            .setStyle(ButtonStyle.Secondary)
    )
}

export default {
    id: 'giveaway-stats',
    async execute(interaction: ButtonInteraction) {
        await interaction.reply({
            components: [await createStatsPanel(interaction.guildId), createRefreshButton()],
            flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
        })
    }
} satisfies ButtonType
