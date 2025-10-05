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

    const pipeline: PipelineStage[] = [
        { $match: { timestamp: { $gte: weekStart, $lt: weekEnd } } },
        {
            $facet: {
                activeUsers: [{ $group: { _id: '$userId' } }, { $count: 'count' }],
                topCommands: [
                    { $group: { _id: '$command', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 5 }
                ]
            }
        }
    ]

    const result = await CommandUsage.aggregate(pipeline)

    const activeUsers = result[0].activeUsers[0]?.count || 0
    const topCommands = result[0].topCommands.map((c) => ({
        command: c._id,
        count: c.count
    }))

    await WeeklyStats.create({
        weekStart,
        activeUsers,
        topCommands
    })
}
