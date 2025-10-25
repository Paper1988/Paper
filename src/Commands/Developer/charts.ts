import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import WeeklyStats from '@/Structures/Schemas/weeklyStats.js'
import CommandUsage from '@/Structures/Schemas/commandUsage.js'

export default {
    data: new SlashCommandBuilder()
        .setName('charts')
        .setDescription('生成統計數據的視覺化圖表')
        .addStringOption((option) =>
            option
                .setName('type')
                .setDescription('選擇圖表類型')
                .setRequired(true)
                .addChoices(
                    { name: '每日使用趨勢', value: 'daily' },
                    { name: '指令使用分布', value: 'commands' },
                    { name: '用戶活躍度', value: 'users' },
                    { name: '時間使用模式', value: 'time' },
                    { name: '綜合儀表板', value: 'dashboard' }
                )
        )
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

        const chartType = interaction.options.getString('type', true)
        const period = interaction.options.getString('period') || 'current'
        const now = new Date()

        // 計算統計期間
        let startDate: Date
        let endDate: Date

        switch (period) {
            case 'previous':
                startDate = new Date(now)
                startDate.setUTCDate(startDate.getUTCDate() - startDate.getUTCDay() - 6)
                startDate.setUTCHours(0, 0, 0, 0)
                endDate = new Date(startDate)
                endDate.setUTCDate(startDate.getUTCDate() + 7)
                break
            case 'month':
                startDate = new Date(now)
                startDate.setUTCDate(startDate.getUTCDate() - startDate.getUTCDay() - 27)
                startDate.setUTCHours(0, 0, 0, 0)
                endDate = new Date(now)
                endDate.setUTCHours(23, 59, 59, 999)
                break
            default: // current
                startDate = new Date(now)
                startDate.setUTCDate(startDate.getUTCDate() - startDate.getUTCDay() + 1)
                startDate.setUTCHours(0, 0, 0, 0)
                endDate = new Date(now)
                endDate.setUTCHours(23, 59, 59, 999)
                break
        }

        let embed: EmbedBuilder = new EmbedBuilder()
        let chartContent: string

        switch (chartType) {
            case 'daily':
                chartContent = await generateDailyChart(startDate, endDate)
                embed
                    .setTitle('📅 每日使用趨勢圖')
                    .setColor(0x4caf50)
                    .setDescription(`\`\`\`\n${chartContent}\`\`\``)
                break

            case 'commands':
                chartContent = await generateCommandChart(startDate, endDate)
                embed
                    .setTitle('📊 指令使用分布圖')
                    .setColor(0x2196f3)
                    .setDescription(`\`\`\`\n${chartContent}\`\`\``)
                break

            case 'users':
                chartContent = await generateUserChart(startDate, endDate)
                embed
                    .setTitle('👥 用戶活躍度圖')
                    .setColor(0xff9800)
                    .setDescription(`\`\`\`\n${chartContent}\`\`\``)
                break

            case 'time':
                chartContent = await generateTimeChart(startDate, endDate)
                embed
                    .setTitle('⏰ 時間使用模式圖')
                    .setColor(0x9c27b0)
                    .setDescription(`\`\`\`\n${chartContent}\`\`\``)
                break

            case 'dashboard':
                chartContent = await generateDashboard(startDate, endDate)
                embed
                    .setTitle('📈 綜合統計儀表板')
                    .setColor(0x607d8b)
                    .setDescription(`\`\`\`\n${chartContent}\`\`\``)
                break
        }

        embed.setTimestamp().setFooter({
            text: `統計期間: ${startDate.toLocaleDateString('zh-TW')} - ${endDate.toLocaleDateString('zh-TW')}`
        })

        await interaction.editReply({ embeds: [embed] })
    }
}

async function generateDailyChart(startDate: Date, endDate: Date): Promise<string> {
    const dailyData = await CommandUsage.aggregate([
        { $match: { timestamp: { $gte: startDate, $lt: endDate } } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ])

    if (dailyData.length === 0) return '無資料'

    const maxCount = Math.max(...dailyData.map((d) => d.count))
    const chartWidth = 20
    const chartHeight = 10

    let chart = '每日使用量趨勢圖\n'
    chart += '='.repeat(30) + '\n\n'

    // 生成圖表
    for (let i = chartHeight; i >= 0; i--) {
        const threshold = (i / chartHeight) * maxCount
        let line = ''

        for (const day of dailyData) {
            if (day.count >= threshold) {
                line += '█ '
            } else {
                line += '  '
            }
        }

        if (i === chartHeight) {
            line += ` ${maxCount}`
        } else if (i === 0) {
            line += ' 0'
        } else if (i === Math.floor(chartHeight / 2)) {
            line += ` ${Math.round(maxCount / 2)}`
        } else {
            line += '  '
        }

        chart += line + '\n'
    }

    // 添加日期標籤
    chart += '\n'
    dailyData.forEach((day) => {
        const date = new Date(day._id)
        const dayName = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
        chart += `${dayName} `
    })
    chart += '\n'

    // 添加數值標籤
    dailyData.forEach((day) => {
        chart += `${day.count.toString().padStart(2)} `
    })

    return chart
}

async function generateCommandChart(startDate: Date, endDate: Date): Promise<string> {
    const commandData = await CommandUsage.aggregate([
        { $match: { timestamp: { $gte: startDate, $lt: endDate } } },
        {
            $group: {
                _id: '$command',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 8 }
    ])

    if (commandData.length === 0) return '無資料'

    const maxCount = commandData[0].count
    const chartWidth = 15

    let chart = '指令使用分布圖\n'
    chart += '='.repeat(30) + '\n\n'

    commandData.forEach((cmd, index) => {
        const barLength = Math.round((cmd.count / maxCount) * chartWidth)
        const bar = '█'.repeat(barLength) + '░'.repeat(chartWidth - barLength)
        const percentage = Math.round(
            (cmd.count / commandData.reduce((sum, c) => sum + c.count, 0)) * 100
        )

        chart += `${(index + 1).toString().padStart(2)}. ${cmd._id.padEnd(12)} ${bar} ${cmd.count} (${percentage}%)\n`
    })

    return chart
}

async function generateUserChart(startDate: Date, endDate: Date): Promise<string> {
    const userData = await CommandUsage.aggregate([
        { $match: { timestamp: { $gte: startDate, $lt: endDate } } },
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
    ])

    if (userData.length === 0) return '無資料'

    const maxCommands = userData[0].commandCount
    const chartWidth = 15

    let chart = '用戶活躍度排行\n'
    chart += '='.repeat(40) + '\n\n'

    userData.forEach((user, index) => {
        const barLength = Math.round((user.commandCount / maxCommands) * chartWidth)
        const bar = '█'.repeat(barLength) + '░'.repeat(chartWidth - barLength)
        const diversity = Math.round((user.uniqueCommands / user.commandCount) * 100)

        chart += `${(index + 1).toString().padStart(2)}. ${user.userId.slice(-8).padEnd(8)} ${bar} ${user.commandCount} (${user.uniqueCommands}種, ${diversity}%)\n`
    })

    return chart
}

async function generateTimeChart(startDate: Date, endDate: Date): Promise<string> {
    const timeData = await CommandUsage.aggregate([
        { $match: { timestamp: { $gte: startDate, $lt: endDate } } },
        {
            $group: {
                _id: { $hour: '$timestamp' },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ])

    if (timeData.length === 0) return '無資料'

    const maxCount = Math.max(...timeData.map((t) => t.count))
    const chartWidth = 20

    let chart = '24小時使用模式\n'
    chart += '='.repeat(30) + '\n\n'

    for (let hour = 0; hour < 24; hour++) {
        const hourData = timeData.find((t) => t._id === hour)
        const count = hourData ? hourData.count : 0
        const barLength = Math.round((count / maxCount) * chartWidth)
        const bar = '█'.repeat(barLength) + '░'.repeat(chartWidth - barLength)

        chart += `${hour.toString().padStart(2)}:00 ${bar} ${count}\n`
    }

    return chart
}

async function generateDashboard(startDate: Date, endDate: Date): Promise<string> {
    const stats = await CommandUsage.aggregate([
        { $match: { timestamp: { $gte: startDate, $lt: endDate } } },
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
                topCommands: [
                    {
                        $group: {
                            _id: '$command',
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { count: -1 } },
                    { $limit: 5 }
                ],
                hourlyUsage: [
                    {
                        $group: {
                            _id: { $hour: '$timestamp' },
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: 1 } }
                ]
            }
        }
    ])

    const data = stats[0]
    const totalCommands = data.totalCommands[0]?.count || 0
    const dailyUsage = data.dailyUsage
    const topCommands = data.topCommands
    const hourlyUsage = data.hourlyUsage

    let dashboard = '📊 綜合統計儀表板\n'
    dashboard += '='.repeat(40) + '\n\n'

    // 基本統計
    dashboard += '📈 基本統計\n'
    dashboard += `總指令數: ${totalCommands.toLocaleString()}\n`
    dashboard += `統計天數: ${dailyUsage.length} 天\n`
    dashboard += `平均每日: ${Math.round(totalCommands / Math.max(1, dailyUsage.length))} 指令\n\n`

    // 每日趨勢 (簡化版)
    if (dailyUsage.length > 0) {
        dashboard += '📅 每日趨勢\n'
        const maxDaily = Math.max(...dailyUsage.map((d) => d.count))
        dailyUsage.slice(-7).forEach((day) => {
            const barLength = Math.round((day.count / maxDaily) * 10)
            const bar = '█'.repeat(barLength) + '░'.repeat(10 - barLength)
            const date = new Date(day._id)
            const dayName = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
            dashboard += `${dayName} ${bar} ${day.count}\n`
        })
        dashboard += '\n'
    }

    // 熱門指令
    if (topCommands.length > 0) {
        dashboard += '🔥 熱門指令\n'
        topCommands.forEach((cmd, index) => {
            const emoji = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][index] || '•'
            dashboard += `${emoji} ${cmd._id}: ${cmd.count} 次\n`
        })
        dashboard += '\n'
    }

    // 時間模式 (簡化版)
    if (hourlyUsage.length > 0) {
        dashboard += '⏰ 使用高峰\n'
        const peakHours = hourlyUsage.sort((a, b) => b.count - a.count).slice(0, 3)

        peakHours.forEach((hour, index) => {
            const emoji = ['🥇', '🥈', '🥉'][index] || '•'
            dashboard += `${emoji} ${hour._id}:00 - ${hour.count} 次\n`
        })
    }

    return dashboard
}
