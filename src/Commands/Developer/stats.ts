import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import WeeklyStats from '@/Structures/Schemas/weeklyStats.js'
import CommandUsage from '@/Structures/Schemas/commandUsage.js'

export default {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('顯示最近一週的使用統計')
        .addStringOption((option) =>
            option
                .setName('period')
                .setDescription('選擇統計期間')
                .setRequired(false)
                .addChoices(
                    { name: '本週', value: 'current' },
                    { name: '上週', value: 'previous' },
                    { name: '過去4週', value: 'month' }
                )
        ),
    developer: true,
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply()

        const period = interaction.options.getString('period') || 'current'
        const now = new Date()

        // 計算統計期間
        let weekStart: Date
        let weekEnd: Date
        let title: string

        switch (period) {
            case 'previous':
                weekStart = new Date(now)
                weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay() - 6)
                weekStart.setUTCHours(0, 0, 0, 0)
                weekEnd = new Date(weekStart)
                weekEnd.setUTCDate(weekStart.getUTCDate() + 7)
                title = '上週統計'
                break
            case 'month':
                weekStart = new Date(now)
                weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay() - 27)
                weekStart.setUTCHours(0, 0, 0, 0)
                weekEnd = new Date(now)
                weekEnd.setUTCHours(23, 59, 59, 999)
                title = '過去4週統計'
                break
            default: // current
                weekStart = new Date(now)
                weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay() + 1)
                weekStart.setUTCHours(0, 0, 0, 0)
                weekEnd = new Date(now)
                weekEnd.setUTCHours(23, 59, 59, 999)
                title = '本週統計'
                break
        }

        // 獲取統計資料
        const stats = await WeeklyStats.findOne({
            weekStart: { $gte: weekStart, $lte: weekEnd }
        }).sort({ weekStart: -1 })

        if (!stats) {
            return interaction.editReply('目前沒有統計資料。')
        }

        // 獲取更詳細的使用統計
        const detailedStats = await CommandUsage.aggregate([
            { $match: { timestamp: { $gte: weekStart, $lt: weekEnd } } },
            {
                $facet: {
                    totalCommands: [{ $count: 'count' }],
                    dailyUsage: [
                        {
                            $group: {
                                _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                                count: { $sum: 1 }
                            }
                        },
                        { $sort: { _id: 1 } }
                    ],
                    userActivity: [
                        {
                            $group: {
                                _id: '$userId',
                                commandCount: { $sum: 1 },
                                uniqueCommands: { $addToSet: '$command' }
                            }
                        },
                        {
                            $project: {
                                userId: '$_id',
                                commandCount: 1,
                                uniqueCommands: { $size: '$uniqueCommands' }
                            }
                        },
                        { $sort: { commandCount: -1 } },
                        { $limit: 10 }
                    ],
                    commandCategories: [
                        {
                            $group: {
                                _id: '$command',
                                count: { $sum: 1 },
                                uniqueUsers: { $addToSet: '$userId' }
                            }
                        },
                        {
                            $project: {
                                command: '$_id',
                                count: 1,
                                uniqueUsers: { $size: '$uniqueUsers' }
                            }
                        },
                        { $sort: { count: -1 } }
                    ]
                }
            }
        ])

        const data = detailedStats[0]
        const totalCommands = data.totalCommands[0]?.count || 0
        const dailyUsage = data.dailyUsage
        const topUsers = data.userActivity
        const commandStats = data.commandCategories

        // 創建嵌入訊息
        const embed = new EmbedBuilder()
            .setTitle(`📊 ${title}`)
            .setColor(0x5865f2)
            .setTimestamp()
            .setFooter({
                text: `統計期間: ${weekStart.toLocaleDateString('zh-TW')} - ${weekEnd.toLocaleDateString('zh-TW')}`
            })

        // 基本統計
        embed.addFields({
            name: '📈 基本統計',
            value: [
                `**總指令數:** ${totalCommands.toLocaleString()}`,
                `**活躍用戶:** ${stats.activeUsers.toLocaleString()}`,
                `**平均每用戶指令數:** ${stats.activeUsers > 0 ? Math.round(totalCommands / stats.activeUsers) : 0}`,
                `**統計天數:** ${Math.ceil((weekEnd.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24))} 天`
            ].join('\n'),
            inline: true
        })

        // 熱門指令
        const topCommandsText = stats.topCommands
            .slice(0, 5)
            .map((cmd: any, index: number) => {
                const emoji = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][index] || '•'
                return `${emoji} \`${cmd.command}\` - **${cmd.count}** 次`
            })
            .join('\n')

        embed.addFields({
            name: '🔥 熱門指令',
            value: topCommandsText || '無資料',
            inline: true
        })

        // 每日使用趨勢
        if (dailyUsage.length > 0) {
            const maxDaily = Math.max(...dailyUsage.map((d) => d.count))
            const dailyTrend = dailyUsage
                .slice(-7)
                .map((d) => {
                    const barLength = Math.round((d.count / maxDaily) * 10)
                    const bar = '█'.repeat(barLength) + '░'.repeat(10 - barLength)
                    return `${d._id}: ${bar} ${d.count}`
                })
                .join('\n')

            embed.addFields({
                name: '📅 每日使用趨勢',
                value: `\`\`\`\n${dailyTrend}\`\`\``,
                inline: false
            })
        }

        // 最活躍用戶
        if (topUsers.length > 0) {
            const topUsersText = topUsers
                .slice(0, 5)
                .map((user, index) => {
                    const emoji = ['👑', '🥇', '🥈', '🥉', '4️⃣'][index] || '•'
                    return `${emoji} <@${user.userId}> - **${user.commandCount}** 次 (${user.uniqueCommands} 種指令)`
                })
                .join('\n')

            embed.addFields({
                name: '👥 最活躍用戶',
                value: topUsersText,
                inline: true
            })
        }

        // 指令多樣性分析
        if (commandStats.length > 0) {
            const totalUniqueCommands = commandStats.length
            const mostUsedCommand = commandStats[0]
            const diversityScore = Math.round((totalUniqueCommands / totalCommands) * 100)

            embed.addFields({
                name: '🎯 使用模式分析',
                value: [
                    `**指令多樣性:** ${totalUniqueCommands} 種不同指令`,
                    `**多樣性分數:** ${diversityScore}%`,
                    `**最受歡迎:** \`${mostUsedCommand.command}\` (${mostUsedCommand.count} 次)`,
                    `**平均每指令使用次數:** ${Math.round(totalCommands / totalUniqueCommands)}`
                ].join('\n'),
                inline: true
            })
        }

        // 使用強度指標
        const avgDailyCommands = Math.round(totalCommands / Math.max(1, dailyUsage.length))
        let intensityLevel = '🟢 低'
        let intensityEmoji = '😴'

        if (avgDailyCommands > 50) {
            intensityLevel = '🔴 極高'
            intensityEmoji = '🚀'
        } else if (avgDailyCommands > 30) {
            intensityLevel = '🟠 高'
            intensityEmoji = '⚡'
        } else if (avgDailyCommands > 15) {
            intensityLevel = '🟡 中'
            intensityEmoji = '💪'
        }

        embed.addFields({
            name: '⚡ 使用強度',
            value: [
                `**強度等級:** ${intensityLevel}`,
                `**每日平均:** ${avgDailyCommands} 指令`,
                `**狀態:** ${intensityEmoji}`
            ].join('\n'),
            inline: true
        })

        await interaction.editReply({ embeds: [embed] })
    }
}
