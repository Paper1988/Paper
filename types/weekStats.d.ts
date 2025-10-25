import { Document } from 'mongoose'

export interface IWeeklyStats extends Document {
    weekStart: Date
    weekEnd: Date
    totalCommands: number
    activeUsers: number
    uniqueCommands: number
    avgCommandsPerUser: number
    avgDailyCommands: number
    commandDiversity: number
    topCommands: Array<{ command: string; count: number; uniqueUsers: number; avgPerUser: number }>
    dailyUsage: Array<{ date: string; count: number; uniqueUsers: number }>
    hourlyUsage: Array<{ hour: number; count: number }>
    powerUsers: number
    regularUsers: number
    casualUsers: number
    peakHour: number
    peakDay: string
    weekendUsage: number
    growthRate: number
    engagementScore: number
    createdAt: Date
    lastUpdated: Date
}
