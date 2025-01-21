const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const GiveawayStats = require('../../Structures/Schemas/GiveawayStats')
const GiveawayHistory = require('../../Structures/Schemas/GiveawayHistory')

module.exports = {
    id: 'giveaway-stats',
    async execute(interaction, client) {
        // 檢查是否存在統計資料
        let stats = await GiveawayStats.findOne({ guildId: interaction.guildId })

        // 如果不存在，創建新的統計資料
        if (!stats) {
            stats = new GiveawayStats({
                guildId: interaction.guildId,
                totalGiveaways: 0,
                activeGiveaways: 0,
                totalPrizes: 0,
                totalParticipants: 0,
                totalWinners: 0
            })
            await stats.save()
        }

        const recentHistory = await GiveawayHistory.find({
            guildId: interaction.guildId
        })
            .sort({ createdAt: -1 })
            .limit(5)

        const statsEmbed = new EmbedBuilder()
            .setTitle('<:richpresent:1265561713969987676> | 抽獎統計')
            .setColor('Blue')
            .addFields(
                {
                    name: '總抽獎次數',
                    value: stats.totalGiveaways.toString(),
                    inline: true
                },
                {
                    name: '進行中抽獎',
                    value: stats.activeGiveaways.toString(),
                    inline: true
                },
                {
                    name: '總參與人次',
                    value: stats.totalParticipants.toString(),
                    inline: true
                },
                {
                    name: '總獎品數量',
                    value: stats.totalPrizes.toString(),
                    inline: true
                },
                {
                    name: '總得獎人數',
                    value: stats.totalWinners.toString(),
                    inline: true
                },
                { name: '\u200B', value: '\u200B', inline: true }
            )

        if (stats.mostActiveHoster?.userId) {
            statsEmbed.addFields({
                name: '最活躍主持人',
                value: `<@${stats.mostActiveHoster.userId}> (${stats.mostActiveHoster.count}次)`,
                inline: true
            })
        }

        if (stats.mostWonUser?.userId) {
            statsEmbed.addFields({
                name: '最幸運用戶',
                value: `<@${stats.mostWonUser.userId}> (${stats.mostWonUser.count}次)`,
                inline: true
            })
        }

        if (recentHistory.length > 0) {
            statsEmbed.addFields({
                name: '最近的抽獎',
                value: recentHistory
                    .map(
                        (h) =>
                            `<:gift:1265560472409735181> ${h.prize} | 贏家: ${h.winners.length > 0 ? h.winners.map((w) => `<@${w}>`).join(', ') : '無'}`
                    )
                    .join('\n')
            })
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('giveaway-refresh-stats')
                .setLabel('重新整理')
                .setEmoji('<:update:1265562455828987968>')
                .setStyle(ButtonStyle.Secondary)
        )

        await interaction.reply({
            embeds: [statsEmbed],
            components: [row],
            ephemeral: true
        })
    }
}
