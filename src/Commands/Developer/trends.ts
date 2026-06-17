import CommandUsage from '@/Structures/Schemas/commandUsage.js'
import WeeklyStats from '@/Structures/Schemas/weeklyStats.js'
import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'

export default {
    developer: true,
    data: new SlashCommandBuilder()
        .setName('trends')
        .setDescription('(僅限開發人員)')
        .addStringOption((option) =>
            option
                .setName('period')
                .setDescription('...')
                .setRequired(true)
                .addChoices(
                    { name: '本週 vs 上週', value: 'week' },
                    { name: '過去4週趨勢', value: 'month' },
                    { name: '過去8週趨勢', value: 'quarter' }
                )
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply()

        const period = interaction.options.getString('period', true)
        const now = new Date()

        let title: string = ''
        let weeks: Date[] = []

        switch (period) {
            case 'week':
                // 本週 vs 上週
                const thisWeekStart = new Date(now)
                thisWeekStart.setUTCDate(thisWeekStart.getUTCDate() - thisWeekStart.getUTCDay() + 1)
                thisWeekStart.setUTCHours(0, 0, 0, 0)

                const lastWeekStart = new Date(thisWeekStart)
                lastWeekStart.setUTCDate(lastWeekStart.getUTCDate() - 7)

                weeks = [lastWeekStart, thisWeekStart]
                title = '本週 vs 上週 比較'
                break

            case 'month':
                // 過去4週
                weeks = []
                for (let i = 3; i >= 0; i--) {
                    const weekStart = new Date(now)
                    weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay() + 1 - i * 7)
                    weekStart.setUTCHours(0, 0, 0, 0)
                    weeks.push(weekStart)
                }
                title = '過去4週趨勢分析'
                break

            case 'quarter':
                // 過去8週
                weeks = []
                for (let i = 7; i >= 0; i--) {
                    const weekStart = new Date(now)
                    weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay() + 1 - i * 7)
                    weekStart.setUTCHours(0, 0, 0, 0)
                    weeks.push(weekStart)
                }
                title = '過去8週趨勢分析'
                break
        }

        // 獲取各週的統計資料
        const weeklyData: any[] = []
        for (const weekStart of weeks) {
            const weekEnd = new Date(weekStart)
            weekEnd.setUTCDate(weekStart.getUTCDate() + 7)

            const stats = await WeeklyStats.findOne({
                weekStart: { $gte: weekStart, $lt: weekEnd }
            }).sort({ weekStart: -1 })

            if (stats) {
                // 獲取該週的詳細統計
                const detailedStats = await CommandUsage.aggregate([
                    { $match: { timestamp: { $gte: weekStart, $lt: weekEnd } } },
                    {
                        $facet: {
                            totalCommands: [{ $count: 'count' }],
                            dailyUsage: [
                                {
                                    $group: {
                                        _id: {
                                            $dateToString: {
                                                format: '%Y-%m-%d',
                                                date: '$timestamp'
                                            }
                                        },
                                        count: { $sum: 1 }
                                    }
                                },
                                { $sort: { _id: 1 } }
                            ]
                        }
                    }
                ])

                const data = detailedStats[0]
                weeklyData.push({
                    weekStart,
                    stats,
                    totalCommands: data.totalCommands[0]?.count || 0,
                    dailyUsage: data.dailyUsage
                })
            }
        }

        if (weeklyData.length === 0) {
            return interaction.editReply('沒有足夠的統計資料進行趨勢分析。')
        }

        // 創建嵌入訊息
        const embed = new EmbedBuilder().setTitle(`📈 ${title}`).setColor(0x00d26a).setTimestamp()

        if (period === 'week' && weeklyData.length === 2) {
            // 本週 vs 上週比較
            const [lastWeek, thisWeek] = weeklyData

            const commandChange = thisWeek.totalCommands - lastWeek.totalCommands
            const userChange = thisWeek.stats.activeUsers - lastWeek.stats.activeUsers
            const commandChangePercent =
                lastWeek.totalCommands > 0
                    ? Math.round((commandChange / lastWeek.totalCommands) * 100)
                    : 0
            const userChangePercent =
                lastWeek.stats.activeUsers > 0
                    ? Math.round((userChange / lastWeek.stats.activeUsers) * 100)
                    : 0

            const getChangeEmoji = (change: number) => {
                if (change > 0) return '📈'
                if (change < 0) return '📉'
                return '➡️'
            }

            const getChangeText = (change: number, percent: number) => {
                const emoji = getChangeEmoji(change)
                const sign = change >= 0 ? '+' : ''
                return `${emoji} ${sign}${change} (${sign}${percent}%)`
            }

            embed.addFields({
                name: '📊 週間比較',
                value: [
                    `**總指令數:**`,
                    `上週: ${lastWeek.totalCommands.toLocaleString()}`,
                    `本週: ${thisWeek.totalCommands.toLocaleString()}`,
                    `變化: ${getChangeText(commandChange, commandChangePercent)}`,
                    '',
                    `**活躍用戶:**`,
                    `上週: ${lastWeek.stats.activeUsers.toLocaleString()}`,
                    `本週: ${thisWeek.stats.activeUsers.toLocaleString()}`,
                    `變化: ${getChangeText(userChange, userChangePercent)}`
                ].join('\n'),
                inline: true
            })

            // 熱門指令變化
            const lastWeekCommands = new Map(
                lastWeek.stats.topCommands.map((c) => [c.command, c.count])
            )
            const thisWeekCommands = new Map(
                thisWeek.stats.topCommands.map((c) => [c.command, c.count])
            )

            const allCommands = new Set([...lastWeekCommands.keys(), ...thisWeekCommands.keys()])
            const commandChanges = Array.from(allCommands)
                .map((command) => {
                    const lastCount = lastWeekCommands.get(command) || 0
                    const thisCount = thisWeekCommands.get(command) || 0
                    const change = (thisCount as number) - (lastCount as number)
                    return { command, lastCount, thisCount, change }
                })
                .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
                .slice(0, 5)

            const commandChangesText = commandChanges
                .map((c) => {
                    const emoji = getChangeEmoji(c.change)
                    return `${emoji} \`${c.command}\`: ${c.lastCount} → ${c.thisCount}`
                })
                .join('\n')

            embed.addFields({
                name: '🔥 熱門指令變化',
                value: commandChangesText || '無變化',
                inline: true
            })
        } else {
            // 多週趨勢分析
            const trendData = weeklyData.map((week, index) => {
                const weekLabel = `第${index + 1}週`
                const avgDaily =
                    week.dailyUsage.length > 0
                        ? Math.round(week.totalCommands / week.dailyUsage.length)
                        : 0
                return {
                    week: weekLabel,
                    commands: week.totalCommands,
                    users: week.stats.activeUsers,
                    avgDaily
                }
            })

            // 計算趨勢
            const commandTrend = calculateTrend(trendData.map((d) => d.commands))
            const userTrend = calculateTrend(trendData.map((d) => d.users))
            const avgDailyTrend = calculateTrend(trendData.map((d) => d.avgDaily))

            embed.addFields({
                name: '📈 趨勢分析',
                value: [
                    `**指令使用趨勢:** ${getTrendEmoji(commandTrend)} ${getTrendText(commandTrend)}`,
                    `**用戶活躍趨勢:** ${getTrendEmoji(userTrend)} ${getTrendText(userTrend)}`,
                    `**每日平均趨勢:** ${getTrendEmoji(avgDailyTrend)} ${getTrendText(avgDailyTrend)}`
                ].join('\n'),
                inline: true
            })

            // 週間數據表格
            const trendTable = trendData
                .map((d) => `${d.week}: ${d.commands} 指令, ${d.users} 用戶, ${d.avgDaily} 日均`)
                .join('\n')

            embed.addFields({
                name: '📅 週間數據',
                value: `\`\`\`\n${trendTable}\`\`\``,
                inline: false
            })

            // 成長預測
            if (trendData.length >= 4) {
                const recentWeeks = trendData.slice(-4)
                const growthRate = calculateGrowthRate(recentWeeks.map((d) => d.commands))

                embed.addFields({
                    name: '🔮 成長預測',
                    value: [
                        `**近期成長率:** ${growthRate > 0 ? '+' : ''}${Math.round(growthRate * 100)}%/週`,
                        `**預測下週指令數:** ${Math.round((trendData[trendData.length - 1]?.commands || 0) * (1 + growthRate))}`,
                        `**趨勢評估:** ${getGrowthAssessment(growthRate)}`
                    ].join('\n'),
                    inline: true
                })
            }
        }

        // 使用模式洞察
        const insights = generateInsights(weeklyData, period)
        if (insights.length > 0) {
            embed.addFields({
                name: '💡 使用洞察',
                value: insights.join('\n'),
                inline: false
            })
        }

        await interaction.editReply({ embeds: [embed] })
    }
}

function calculateTrend(values: number[]): 'up' | 'down' | 'stable' {
    if (values.length < 2) return 'stable'

    const firstHalf = values.slice(0, Math.ceil(values.length / 2))
    const secondHalf = values.slice(Math.floor(values.length / 2))

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length

    const change = (secondAvg - firstAvg) / firstAvg

    if (change > 0.1) return 'up'
    if (change < -0.1) return 'down'
    return 'stable'
}

function getTrendEmoji(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
        case 'up':
            return '📈'
        case 'down':
            return '📉'
        case 'stable':
            return '➡️'
    }
}

function getTrendText(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
        case 'up':
            return '上升趨勢'
        case 'down':
            return '下降趨勢'
        case 'stable':
            return '穩定'
    }
}

function calculateGrowthRate(values: number[]): number {
    if (values.length < 2) return 0

    const first = values[0] || 0
    const last = values[values.length - 1] || 0
    const periods = values.length - 1

    return Math.pow(last / first, 1 / periods) - 1
}

function getGrowthAssessment(growthRate: number): string {
    if (growthRate > 0.1) return '🚀 強勁成長'
    if (growthRate > 0.05) return '📈 穩定成長'
    if (growthRate > 0) return '📊 微幅成長'
    if (growthRate > -0.05) return '📉 微幅下降'
    return '⚠️ 需要關注'
}

function generateInsights(weeklyData: any[], period: string): string[] {
    const insights: string[] = []

    if (weeklyData.length >= 2) {
        const totalCommands = weeklyData.map((w) => w.totalCommands)
        const maxCommands = Math.max(...totalCommands)
        const minCommands = Math.min(...totalCommands)
        const variance = (maxCommands - minCommands) / maxCommands

        if (variance > 0.5) {
            insights.push('📊 使用量波動較大，建議關注特定事件影響')
        } else if (variance < 0.2) {
            insights.push('📈 使用模式穩定，用戶習慣已建立')
        }

        // 檢查是否有週末效應
        const hasWeekendEffect = weeklyData.some((week) => {
            const weekendDays = week.dailyUsage.filter((d: any) => {
                const date = new Date(d._id)
                const day = date.getDay()
                return day === 0 || day === 6 // 週六或週日
            })
            return weekendDays.length > 0 && weekendDays.every((d: any) => d.count < 10)
        })

        if (hasWeekendEffect) {
            insights.push('🏖️ 發現週末使用量下降，符合一般使用模式')
        }

        // 檢查用戶參與度
        const avgUsersPerWeek =
            weeklyData.reduce((sum, week) => sum + week.stats.activeUsers, 0) / weeklyData.length
        const totalUniqueUsers = new Set(
            weeklyData.flatMap((week) => week.stats.topCommands.map((cmd: any) => cmd.command))
        ).size

        if (avgUsersPerWeek > 20) {
            insights.push('👥 用戶參與度良好，社群活躍')
        } else if (avgUsersPerWeek < 10) {
            insights.push('💡 建議增加用戶參與度，可考慮推廣活動')
        }
    }

    return insights
}
