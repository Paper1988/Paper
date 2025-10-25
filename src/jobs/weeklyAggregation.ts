import CommandUsage from '@/Structures/Schemas/commandUsage.js'
import WeeklyStats from '@/Structures/Schemas/weeklyStats.js'
import type { PipelineStage } from 'mongoose'

export async function aggregateWeeklyStats() {
    const now = new Date()
    // 找這週的週一（起始日）
    const weekStart = new Date(now)
    weekStart.setUTCHours(0, 0, 0, 0)
    weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay() + 1) // 設成週一

    const weekEnd = new Date(weekStart)
    weekEnd.setUTCDate(weekStart.getUTCDate() + 7)

    // 檢查是否已經存在該週的統計
    const existingStats = await WeeklyStats.findOne({
        weekStart: { $gte: weekStart, $lt: weekEnd }
    })

    if (existingStats) {
        console.log(`週統計已存在: ${weekStart.toISOString()}`)
        return existingStats
    }

    // 複雜的聚合管道，獲取多維度統計
    const pipeline: PipelineStage[] = [
        { $match: { timestamp: { $gte: weekStart, $lt: weekEnd } } },
        {
            $facet: {
                // 基本統計
                basicStats: [
                    {
                        $group: {
                            _id: null,
                            totalCommands: { $sum: 1 },
                            uniqueUsers: { $addToSet: '$userId' },
                            uniqueCommands: { $addToSet: '$command' }
                        }
                    },
                    {
                        $project: {
                            totalCommands: 1,
                            activeUsers: { $size: '$uniqueUsers' },
                            uniqueCommands: { $size: '$uniqueCommands' }
                        }
                    }
                ],

                // 每日使用統計
                dailyUsage: [
                    {
                        $group: {
                            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                            count: { $sum: 1 },
                            uniqueUsers: { $addToSet: '$userId' }
                        }
                    },
                    {
                        $project: {
                            date: '$_id',
                            count: 1,
                            uniqueUsers: { $size: '$uniqueUsers' }
                        }
                    },
                    { $sort: { date: 1 } }
                ],

                // 每小時使用統計
                hourlyUsage: [
                    {
                        $group: {
                            _id: { $hour: '$timestamp' },
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: 1 } }
                ],

                // 指令使用統計（包含用戶資訊）
                commandStats: [
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
                    { $sort: { count: -1 } },
                    { $limit: 10 }
                ],

                // 用戶活躍度統計
                userActivity: [
                    {
                        $group: {
                            _id: '$userId',
                            commandCount: { $sum: 1 },
                            uniqueCommands: { $addToSet: '$command' },
                            activeDays: {
                                $addToSet: {
                                    $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            userId: '$_id',
                            commandCount: 1,
                            uniqueCommands: { $size: '$uniqueCommands' },
                            activeDays: { $size: '$activeDays' },
                            commandDiversity: {
                                $divide: [{ $size: '$uniqueCommands' }, '$commandCount']
                            }
                        }
                    },
                    { $sort: { commandCount: -1 } }
                ]
            }
        }
    ]

    const result = await CommandUsage.aggregate(pipeline)
    const data = result[0]

    // 處理基本統計
    const basicStats = data.basicStats[0] || {
        totalCommands: 0,
        activeUsers: 0,
        uniqueCommands: 0
    }

    // 處理每日使用統計
    const dailyUsage = data.dailyUsage.map((day: any) => ({
        date: day.date,
        count: day.count,
        uniqueUsers: day.uniqueUsers
    }))

    // 處理每小時使用統計
    const hourlyUsage = data.hourlyUsage.map((hour: any) => ({
        hour: hour._id,
        count: hour.count
    }))

    // 處理指令統計
    const topCommands = data.commandStats.map((cmd: any) => ({
        command: cmd.command,
        count: cmd.count,
        uniqueUsers: cmd.uniqueUsers,
        avgPerUser: cmd.count / cmd.uniqueUsers
    }))

    // 處理用戶活躍度
    const userActivity = data.userActivity
    const avgCommandsPerUser =
        basicStats.activeUsers > 0
            ? Math.round(basicStats.totalCommands / basicStats.activeUsers)
            : 0

    // 計算用戶分層
    const powerUsers = userActivity.filter(
        (u: any) => u.commandCount >= avgCommandsPerUser * 2
    ).length
    const regularUsers = userActivity.filter(
        (u: any) => u.commandCount >= avgCommandsPerUser && u.commandCount < avgCommandsPerUser * 2
    ).length
    const casualUsers = userActivity.filter((u: any) => u.commandCount < avgCommandsPerUser).length

    // 計算指令多樣性分數
    const commandDiversity =
        basicStats.uniqueCommands > 0
            ? Math.round((basicStats.uniqueCommands / basicStats.totalCommands) * 100) / 100
            : 0

    // 計算平均每日指令數
    const avgDailyCommands =
        dailyUsage.length > 0 ? Math.round(basicStats.totalCommands / dailyUsage.length) : 0

    // 找出使用高峰
    const peakHour =
        hourlyUsage.length > 0
            ? hourlyUsage.reduce(
                  (max: any, hour: any) => (hour.count > max.count ? hour : max),
                  hourlyUsage[0]
              ).hour
            : 0

    const peakDay =
        dailyUsage.length > 0
            ? dailyUsage.reduce(
                  (max: any, day: any) => (day.count > max.count ? day : max),
                  dailyUsage[0]
              ).date
            : '週一'

    // 計算週末使用量
    const weekendUsage = dailyUsage
        .filter((day: any) => {
            const date = new Date(day.date)
            const dayOfWeek = date.getDay()
            return dayOfWeek === 0 || dayOfWeek === 6 // 週六或週日
        })
        .reduce((sum: number, day: any) => sum + day.count, 0)

    // 計算成長率（與上週比較）
    const lastWeekStart = new Date(weekStart)
    lastWeekStart.setUTCDate(lastWeekStart.getUTCDate() - 7)
    const lastWeekEnd = new Date(lastWeekStart)
    lastWeekEnd.setUTCDate(lastWeekStart.getUTCDate() + 7)

    const lastWeekStats = await WeeklyStats.findOne({
        weekStart: { $gte: lastWeekStart, $lt: lastWeekEnd }
    })

    const growthRate = lastWeekStats
        ? ((basicStats.totalCommands - lastWeekStats.totalCommands) / lastWeekStats.totalCommands) *
          100
        : 0

    // 計算參與度分數
    const engagementScore = calculateEngagementScore({
        activeUsers: basicStats.activeUsers,
        avgCommandsPerUser,
        commandDiversity,
        powerUsers,
        regularUsers,
        casualUsers
    })

    // 創建週統計記錄
    const weeklyStats = await WeeklyStats.create({
        weekStart,
        weekEnd,

        // 基本統計
        totalCommands: basicStats.totalCommands,
        activeUsers: basicStats.activeUsers,
        uniqueCommands: basicStats.uniqueCommands,

        // 使用模式
        avgCommandsPerUser,
        avgDailyCommands,
        commandDiversity,

        // 詳細統計
        topCommands,
        dailyUsage,
        hourlyUsage,

        // 用戶參與度指標
        powerUsers,
        regularUsers,
        casualUsers,

        // 時間模式分析
        peakHour,
        peakDay,
        weekendUsage,

        // 趨勢指標
        growthRate: Math.round(growthRate * 100) / 100,
        engagementScore
    })

    console.log(
        `週統計聚合完成: ${weekStart.toISOString()} - 總指令: ${basicStats.totalCommands}, 活躍用戶: ${basicStats.activeUsers}`
    )

    return weeklyStats
}

/**
 * 計算參與度分數 (0-100)
 */
function calculateEngagementScore({
    activeUsers,
    avgCommandsPerUser,
    commandDiversity,
    powerUsers,
    regularUsers,
    casualUsers
}: {
    activeUsers: number
    avgCommandsPerUser: number
    commandDiversity: number
    powerUsers: number
    regularUsers: number
    casualUsers: number
}): number {
    let score = 0

    // 用戶活躍度 (30%)
    if (avgCommandsPerUser >= 20) score += 30
    else if (avgCommandsPerUser >= 10) score += 20
    else if (avgCommandsPerUser >= 5) score += 10

    // 指令多樣性 (25%)
    score += Math.min(commandDiversity * 25, 25)

    // 用戶分層健康度 (25%)
    const totalUsers = powerUsers + regularUsers + casualUsers
    if (totalUsers > 0) {
        const powerUserRatio = powerUsers / totalUsers
        const regularUserRatio = regularUsers / totalUsers

        if (powerUserRatio >= 0.1 && regularUserRatio >= 0.3) score += 25
        else if (powerUserRatio >= 0.05 && regularUserRatio >= 0.2) score += 20
        else if (powerUserRatio >= 0.02) score += 15
        else score += 10
    }

    // 用戶基數 (20%)
    if (activeUsers >= 50) score += 20
    else if (activeUsers >= 20) score += 15
    else if (activeUsers >= 10) score += 10
    else if (activeUsers >= 5) score += 5

    return Math.min(Math.round(score), 100)
}

/**
 * 獲取歷史統計數據用於趨勢分析
 */
export async function getHistoricalStats(weeks: number = 8) {
    const now = new Date()
    const startDate = new Date(now)
    startDate.setUTCDate(startDate.getUTCDate() - startDate.getUTCDay() + 1 - (weeks - 1) * 7)
    startDate.setUTCHours(0, 0, 0, 0)

    return await WeeklyStats.find({
        weekStart: { $gte: startDate }
    }).sort({ weekStart: 1 })
}

/**
 * 計算週間成長率
 */
export async function calculateWeeklyGrowthRate() {
    const now = new Date()
    const thisWeekStart = new Date(now)
    thisWeekStart.setUTCDate(thisWeekStart.getUTCDate() - thisWeekStart.getUTCDay() + 1)
    thisWeekStart.setUTCHours(0, 0, 0, 0)

    const lastWeekStart = new Date(thisWeekStart)
    lastWeekStart.setUTCDate(lastWeekStart.getUTCDate() - 7)

    const [thisWeek, lastWeek] = await Promise.all([
        WeeklyStats.findOne({ weekStart: { $gte: thisWeekStart } }).sort({ weekStart: -1 }),
        WeeklyStats.findOne({ weekStart: { $gte: lastWeekStart, $lt: thisWeekStart } }).sort({
            weekStart: -1
        })
    ])

    if (!thisWeek || !lastWeek) return 0

    return ((thisWeek.totalCommands - lastWeek.totalCommands) / lastWeek.totalCommands) * 100
}
