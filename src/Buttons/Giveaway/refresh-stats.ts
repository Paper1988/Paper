import GiveawayHistory from '@/Structures/Schemas/GiveawayHistory.js'
import GiveawayStats from '@/Structures/Schemas/GiveawayStats.js'
import type { ButtonType } from '@/typings/component.js'
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    EmbedBuilder
} from 'discord.js'

const ACCENT_COLOR = 0xA3A3A3

async function createStatsEmbed(guildId: string | null) {
    const stats = await GiveawayStats.findOne({ guildId })
    const recentHistory = await GiveawayHistory.find({ guildId })
        .sort({ createdAt: -1 })
        .limit(5)

    const embed = new EmbedBuilder()
        .setColor(ACCENT_COLOR)
        .setTitle('抽獎統計')
        .setDescription('此伺服器的活動概況')
        .addFields(
            { name: '總活動', value: String(stats?.totalGiveaways ?? 0), inline: true },
            { name: '進行中', value: String(stats?.activeGiveaways ?? 0), inline: true },
            { name: '參與人次', value: String(stats?.totalParticipants ?? 0), inline: true },
            { name: '獎品數', value: String(stats?.totalPrizes ?? 0), inline: true },
            { name: '得獎人次', value: String(stats?.totalWinners ?? 0), inline: true }
        )

    if (stats?.mostActiveHoster?.userId) {
        embed.addFields({
            name: '最活躍主持人',
            value: '<@' + stats.mostActiveHoster.userId + '> · ' + (stats.mostActiveHoster.count ?? 0) + ' 次',
            inline: true
        })
    }

    if (stats?.mostWonUser?.userId) {
        embed.addFields({
            name: '最多次得獎',
            value: '<@' + stats.mostWonUser.userId + '> · ' + (stats.mostWonUser.count ?? 0) + ' 次',
            inline: true
        })
    }

    if (recentHistory.length > 0) {
        embed.addFields({
            name: '最近結束的活動',
            value: recentHistory.map((item) => {
                const winners = item.winners.length
                    ? item.winners.map((id) => '<@' + id + '>').join(', ')
                    : '無得獎者'
                return '**' + item.prize + '** · ' + winners
            }).join('\n').slice(0, 1024)
        })
    } else {
        embed.addFields({ name: '最近結束的活動', value: '尚無活動紀錄。' })
    }

    return embed.setFooter({ text: 'Paper Giveaway' })
}

function createRefreshButton() {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('giveaway-refresh-stats')
            .setLabel('重新整理')
            .setEmoji('↻')
            .setStyle(ButtonStyle.Secondary)
    )
}

export default {
    id: 'giveaway-refresh-stats',
    async execute(interaction: ButtonInteraction) {
        await interaction.update({
            embeds: [await createStatsEmbed(interaction.guildId)],
            components: [createRefreshButton()]
        })
    }
} satisfies ButtonType
