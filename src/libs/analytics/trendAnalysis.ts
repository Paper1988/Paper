import WeeklyStats from '@/Structures/Schemas/weeklyStats.js'
import type { Document } from 'mongoose'

export interface TrendData {
    weekStart: Date
    totalCommands: number
    activeUsers: number
    engagementScore: number
    growthRate: number
}

export interface TrendAnalysis {
    trend: 'up' | 'down' | 'stable'
    strength: 'weak' | 'moderate' | 'strong'
    confidence: number
    prediction: {
        nextWeek: number
        nextMonth: number
    }
    insights: string[]
}

/**
 * 分析週間趨勢
 */
export async function analyzeWeeklyTrends(weeks: number = 8): Promise<TrendAnalysis> {
    const historicalData = await getHistoricalStats(weeks)

    if (historicalData.length < 2) {
        return {
            trend: 'stable',
            strength: 'weak',
            confidence: 0,
            prediction: { nextWeek: 0, nextMonth: 0 },
            insights: ['資料不足，無法進行趨勢分析']
        }
    }

    const trendData = historicalData.map((week) => ({
        weekStart: week.weekStart,
        totalCommands: week.totalCommands,
        activeUsers: week.activeUsers,
        engagementScore: week.engagementScore,
        growthRate: week.growthRate
    }))

    // 計算趨勢方向
    const trend = calculateTrendDirection(trendData)

    // 計算趨勢強度
    const strength = calculateTrendStrength(trendData)

    // 計算信心度
    const confidence = calculateConfidence(trendData)

    // 預測未來值
    const prediction = predictFutureValues(trendData)

    // 生成洞察
    const insights = generateTrendInsights(trendData, trend, strength)

    return {
        trend,
        strength,
        confidence,
        prediction,
        insights
    }
}

/**
 * 分析用戶參與度趨勢
 */
export async function analyzeEngagementTrends(weeks: number = 8): Promise<{
    engagementTrend: 'improving' | 'declining' | 'stable'
    userSegmentation: {
        powerUsers: number[]
        regularUsers: number[]
        casualUsers: number[]
    }
    recommendations: string[]
}> {
    const historicalData = await getHistoricalStats(weeks)

    if (historicalData.length < 2) {
        return {
            engagementTrend: 'stable',
            userSegmentation: { powerUsers: [], regularUsers: [], casualUsers: [] },
            recommendations: ['需要更多數據進行分析']
        }
    }

    // 分析參與度趨勢
    const engagementScores = historicalData.map((week) => week.engagementScore)
    const engagementTrend = calculateEngagementTrend(engagementScores)

    // 分析用戶分層變化
    const userSegmentation = {
        powerUsers: historicalData.map((week) => week.powerUsers),
        regularUsers: historicalData.map((week) => week.regularUsers),
        casualUsers: historicalData.map((week) => week.casualUsers)
    }

    // 生成建議
    const recommendations = generateEngagementRecommendations(historicalData, engagementTrend)

    return {
        engagementTrend,
        userSegmentation,
        recommendations
    }
}

/**
 * 分析指令使用模式趨勢
 */
export async function analyzeCommandTrends(weeks: number = 8): Promise<{
    emergingCommands: Array<{ command: string; growth: number }>
    decliningCommands: Array<{ command: string; decline: number }>
    stableCommands: Array<{ command: string; stability: number }>
    insights: string[]
}> {
    const historicalData = await getHistoricalStats(weeks)

    if (historicalData.length < 2) {
        return {
            emergingCommands: [],
            decliningCommands: [],
            stableCommands: [],
            insights: ['需要更多數據進行分析']
        }
    }

    // 收集所有指令的使用數據
    const commandHistory = new Map<string, number[]>()

    historicalData.forEach((week) => {
        week.topCommands.forEach((cmd) => {
            if (!commandHistory.has(cmd.command)) {
                commandHistory.set(cmd.command, new Array(historicalData.length).fill(0))
            }
            const index = historicalData.indexOf(week)
            commandHistory.get(cmd.command)![index] = cmd.count
        })
    })

    // 分析指令趨勢
    const emergingCommands: Array<{ command: string; growth: number }> = []
    const decliningCommands: Array<{ command: string; decline: number }> = []
    const stableCommands: Array<{ command: string; stability: number }> = []

    commandHistory.forEach((usage, command) => {
        const trend = calculateCommandTrend(usage)

        if (trend.growth > 0.2) {
            emergingCommands.push({ command, growth: trend.growth })
        } else if (trend.growth < -0.2) {
            decliningCommands.push({ command, decline: Math.abs(trend.growth) })
        } else {
            stableCommands.push({ command, stability: 1 - Math.abs(trend.growth) })
        }
    })

    // 排序
    emergingCommands.sort((a, b) => b.growth - a.growth)
    decliningCommands.sort((a, b) => b.decline - a.decline)
    stableCommands.sort((a, b) => b.stability - a.stability)

    // 生成洞察
    const insights = generateCommandInsights(emergingCommands, decliningCommands, stableCommands)

    return {
        emergingCommands: emergingCommands.slice(0, 5),
        decliningCommands: decliningCommands.slice(0, 5),
        stableCommands: stableCommands.slice(0, 5),
        insights
    }
}

/**
 * 獲取歷史統計數據
 */
async function getHistoricalStats(weeks: number) {
    const now = new Date()
    const startDate = new Date(now)
    startDate.setUTCDate(startDate.getUTCDate() - startDate.getUTCDay() + 1 - (weeks - 1) * 7)
    startDate.setUTCHours(0, 0, 0, 0)

    return await WeeklyStats.find({
        weekStart: { $gte: startDate }
    }).sort({ weekStart: 1 })
}

/**
 * 計算趨勢方向
 */
function calculateTrendDirection(data: TrendData[]): 'up' | 'down' | 'stable' {
    if (data.length < 2) return 'stable'

    const firstHalf = data.slice(0, Math.ceil(data.length / 2))
    const secondHalf = data.slice(Math.floor(data.length / 2))

    const firstAvg = firstHalf.reduce((sum, week) => sum + week.totalCommands, 0) / firstHalf.length
    const secondAvg =
        secondHalf.reduce((sum, week) => sum + week.totalCommands, 0) / secondHalf.length

    const change = (secondAvg - firstAvg) / firstAvg

    if (change > 0.1) return 'up'
    if (change < -0.1) return 'down'
    return 'stable'
}

/**
 * 計算趨勢強度
 */
function calculateTrendStrength(data: TrendData[]): 'weak' | 'moderate' | 'strong' {
    if (data.length < 2) return 'weak'

    const values = data.map((d) => d.totalCommands)
    const variance = calculateVariance(values)
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const coefficient = Math.sqrt(variance) / mean

    if (coefficient > 0.3) return 'strong'
    if (coefficient > 0.15) return 'moderate'
    return 'weak'
}

/**
 * 計算信心度
 */
function calculateConfidence(data: TrendData[]): number {
    if (data.length < 3) return 0

    const values = data.map((d) => d.totalCommands)
    const correlation = calculateCorrelation(
        values,
        Array.from({ length: values.length }, (_, i) => i)
    )

    return Math.max(0, Math.min(100, Math.round(correlation * 100)))
}

/**
 * 預測未來值
 */
function predictFutureValues(data: TrendData[]): { nextWeek: number; nextMonth: number } {
    if (data.length < 2) return { nextWeek: 0, nextMonth: 0 }

    const values = data.map((d) => d.totalCommands)
    const trend = calculateLinearTrend(values)

    const lastValue = values[values.length - 1] || 0
    const nextWeek = Math.round(lastValue + trend)
    const nextMonth = Math.round(lastValue + trend * 4)

    return { nextWeek, nextMonth }
}

/**
 * 計算參與度趨勢
 */
function calculateEngagementTrend(scores: number[]): 'improving' | 'declining' | 'stable' {
    if (scores.length < 2) return 'stable'

    const firstHalf = scores.slice(0, Math.ceil(scores.length / 2))
    const secondHalf = scores.slice(Math.floor(scores.length / 2))

    const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length

    const change = secondAvg - firstAvg

    if (change > 5) return 'improving'
    if (change < -5) return 'declining'
    return 'stable'
}

/**
 * 計算指令趨勢
 */
function calculateCommandTrend(usage: number[]): { growth: number } {
    if (usage.length < 2) return { growth: 0 }

    const firstHalf = usage.slice(0, Math.ceil(usage.length / 2))
    const secondHalf = usage.slice(Math.floor(usage.length / 2))

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length

    if (firstAvg === 0) return { growth: secondAvg > 0 ? 1 : 0 }

    return { growth: (secondAvg - firstAvg) / firstAvg }
}

/**
 * 計算變異數
 */
function calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const squaredDiffs = values.map((val) => Math.pow(val - mean, 2))
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
}

/**
 * 計算相關係數
 */
function calculateCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length)
    if (n < 2) return 0

    const sumX = x.slice(0, n).reduce((sum, val) => sum + val, 0)
    const sumY = y.slice(0, n).reduce((sum, val) => sum + val, 0)
    const sumXY = x.slice(0, n).reduce((sum, val, i) => {
        const yVal = y[i]
        return sum + val * (yVal !== undefined ? yVal : 0)
    }, 0)
    const sumXX = x.slice(0, n).reduce((sum, val) => sum + val * val, 0)
    const sumYY = y.slice(0, n).reduce((sum, val) => sum + val * val, 0)

    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY))

    return denominator === 0 ? 0 : numerator / denominator
}

/**
 * 計算線性趨勢
 */
function calculateLinearTrend(values: number[]): number {
    if (values.length < 2) return 0

    const n = values.length
    const x = Array.from({ length: n }, (_, i) => i)
    const y = values

    const sumX = x.reduce((sum, val) => sum + val, 0)
    const sumY = y.reduce((sum, val) => sum + val, 0)
    const sumXY = x.reduce((sum, val, i) => {
        const yVal = y[i]
        return sum + val * (yVal !== undefined ? yVal : 0)
    }, 0)
    const sumXX = x.reduce((sum, val) => sum + val * val, 0)

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
}

/**
 * 生成趨勢洞察
 */
function generateTrendInsights(
    data: TrendData[],
    trend: 'up' | 'down' | 'stable',
    strength: 'weak' | 'moderate' | 'strong'
): string[] {
    const insights: string[] = []

    if (trend === 'up' && strength === 'strong') {
        insights.push('📈 使用量呈現強勁上升趨勢，社群活躍度持續提升')
    } else if (trend === 'up' && strength === 'moderate') {
        insights.push('📊 使用量穩步上升，顯示健康成長')
    } else if (trend === 'down' && strength === 'strong') {
        insights.push('⚠️ 使用量顯著下降，需要關注用戶流失問題')
    } else if (trend === 'down' && strength === 'moderate') {
        insights.push('📉 使用量略有下降，建議檢查功能使用情況')
    } else {
        insights.push('➡️ 使用量保持穩定，社群狀態良好')
    }

    // 分析最新數據
    const latest = data[data.length - 1]
    const previous = data[data.length - 2]

    if (latest && previous) {
        const commandChange = latest.totalCommands - previous.totalCommands
        const userChange = latest.activeUsers - previous.activeUsers

        if (commandChange > 0) {
            insights.push(`📊 本週指令使用量增加 ${commandChange} 次`)
        } else if (commandChange < 0) {
            insights.push(`📉 本週指令使用量減少 ${Math.abs(commandChange)} 次`)
        }

        if (userChange > 0) {
            insights.push(`👥 活躍用戶增加 ${userChange} 人`)
        } else if (userChange < 0) {
            insights.push(`👥 活躍用戶減少 ${Math.abs(userChange)} 人`)
        }
    }

    return insights
}

/**
 * 生成參與度建議
 */
function generateEngagementRecommendations(
    data: any[],
    engagementTrend: 'improving' | 'declining' | 'stable'
): string[] {
    const recommendations: string[] = []

    if (engagementTrend === 'declining') {
        recommendations.push('🎯 建議舉辦活動提升用戶參與度')
        recommendations.push('💡 考慮增加新功能吸引用戶')
        recommendations.push('📢 加強社群互動和用戶溝通')
    } else if (engagementTrend === 'improving') {
        recommendations.push('✅ 參與度持續改善，保持現有策略')
        recommendations.push('🚀 可考慮推出進階功能滿足重度用戶')
    } else {
        recommendations.push('📊 參與度穩定，可考慮微調功能')
    }

    // 基於用戶分層的建議
    const latest = data[data.length - 1]
    if (latest) {
        const totalUsers = latest.powerUsers + latest.regularUsers + latest.casualUsers
        if (totalUsers > 0) {
            const powerUserRatio = latest.powerUsers / totalUsers
            const casualUserRatio = latest.casualUsers / totalUsers

            if (powerUserRatio < 0.05) {
                recommendations.push('🔥 重度用戶比例偏低，建議培養核心用戶群')
            }

            if (casualUserRatio > 0.7) {
                recommendations.push('💪 一般用戶比例過高，建議提升用戶活躍度')
            }
        }
    }

    return recommendations
}

/**
 * 生成指令洞察
 */
function generateCommandInsights(
    emerging: Array<{ command: string; growth: number }>,
    declining: Array<{ command: string; decline: number }>,
    stable: Array<{ command: string; stability: number }>
): string[] {
    const insights: string[] = []

    if (emerging.length > 0) {
        insights.push(`🚀 發現 ${emerging.length} 個新興指令，用戶接受度良好`)
        if (emerging[0]) {
            insights.push(`📈 \`${emerging[0].command}\` 成長最快，可考慮重點推廣`)
        }
    }

    if (declining.length > 0) {
        insights.push(`📉 發現 ${declining.length} 個使用量下降的指令`)
        if (declining[0]) {
            insights.push(`⚠️ \`${declining[0].command}\` 使用量下降，建議檢查功能問題`)
        }
    }

    if (stable.length > 0) {
        insights.push(`✅ 發現 ${stable.length} 個穩定使用的核心指令`)
    }

    return insights
}
