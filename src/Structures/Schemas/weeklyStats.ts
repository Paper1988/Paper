import { Schema, model } from 'mongoose'
import type { IWeeklyStats } from '@/../types/weekStats'

const commandUsageSchema = new Schema(
    {
        command: { type: String, required: true },
        count: { type: Number, required: true },
        uniqueUsers: { type: Number, required: true },
        avgPerUser: { type: Number, required: true }
    },
    { _id: false }
)

const dailyUsageSchema = new Schema(
    {
        date: { type: String, required: true }, // YYYY-MM-DD format
        count: { type: Number, required: true },
        uniqueUsers: { type: Number, required: true }
    },
    { _id: false }
)

const hourlyUsageSchema = new Schema(
    {
        hour: { type: Number, required: true, min: 0, max: 23 },
        count: { type: Number, required: true }
    },
    { _id: false }
)

const weeklyStatsSchema = new Schema<any>(
    {
        weekStart: { type: Date, required: true },
        weekEnd: { type: Date, required: true },
        totalCommands: { type: Number, required: true, default: 0 },
        activeUsers: { type: Number, required: true, default: 0 },
        uniqueCommands: { type: Number, required: true, default: 0 },
        avgCommandsPerUser: { type: Number, required: true, default: 0 },
        avgDailyCommands: { type: Number, required: true, default: 0 },
        commandDiversity: { type: Number, required: true, default: 0 },
        topCommands: [commandUsageSchema],
        dailyUsage: [dailyUsageSchema],
        hourlyUsage: [hourlyUsageSchema],
        powerUsers: { type: Number, required: true, default: 0 },
        regularUsers: { type: Number, required: true, default: 0 },
        casualUsers: { type: Number, required: true, default: 0 },
        peakHour: { type: Number, required: true, default: 0 },
        peakDay: { type: String, required: true, default: '週一' },
        weekendUsage: { type: Number, required: true, default: 0 },
        growthRate: { type: Number, default: 0 },
        engagementScore: { type: Number, required: true, default: 0 },
        createdAt: { type: Date, default: Date.now },
        lastUpdated: { type: Date, default: Date.now }
    },
    {
        timestamps: true,
        collection: 'weeklyStats'
    }
)

// 索引優化
weeklyStatsSchema.index({ weekStart: 1 })
weeklyStatsSchema.index({ createdAt: -1 })
weeklyStatsSchema.index({ totalCommands: -1 })
weeklyStatsSchema.index({ activeUsers: -1 })

export default model<IWeeklyStats>('WeeklyStats', weeklyStatsSchema)
