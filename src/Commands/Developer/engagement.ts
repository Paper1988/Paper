import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import CommandUsage from '@/Structures/Schemas/commandUsage.js'

export default {
    data: new SlashCommandBuilder()
        .setName('engagement')
        .setDescription('分析用戶參與度和使用模式')
        .addStringOption((option) =>
            option
                .setName('period')
                .setDescription('選擇分析期間')
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

        // 計算分析期間
        let startDate: Date
        let endDate: Date
        let title: string

        switch (period) {
            case 'previous':
                startDate = new Date(now)
                startDate.setUTCDate(startDate.getUTCDate() - startDate.getUTCDay() - 6)
                startDate.setUTCHours(0, 0, 0, 0)
                endDate = new Date(startDate)
                endDate.setUTCDate(startDate.getUTCDate() + 7)
                title = '上週用戶參與度分析'
                break
            case 'month':
                startDate = new Date(now)
                startDate.setUTCDate(startDate.getUTCDate() - startDate.getUTCDay() - 27)
                startDate.setUTCHours(0, 0, 0, 0)
                endDate = new Date(now)
                endDate.setUTCHours(23, 59, 59, 999)
                title = '過去4週用戶參與度分析'
                break
            default: // current
                startDate = new Date(now)
                startDate.setUTCDate(startDate.getUTCDate() - startDate.getUTCDay() + 1)
                startDate.setUTCHours(0, 0, 0, 0)
                endDate = new Date(now)
                endDate.setUTCHours(23, 59, 59, 999)
                title = '本週用戶參與度分析'
                break
        }

        // 獲取用戶參與度數據
        const engagementData = await CommandUsage.aggregate([
            { $match: { timestamp: { $gte: startDate, $lt: endDate } } },
            {
                $facet: {
                    userActivity: [
                        {
                            $group: {
                                _id: '$userId',
                                totalCommands: { $sum: 1 },
                                uniqueCommands: { $addToSet: '$command' },
                                firstUse: { $min: '$timestamp' },
                                lastUse: { $max: '$timestamp' },
                                dailyUsage: {
                                    $push: {
                                        date: {
                                            $dateToString: {
                                                format: '%Y-%m-%d',
                                                date: '$timestamp'
                                            }
                                        },
                                        command: '$command'
                                    }
                                }
                            }
                        },
                        {
                            $project: {
                                userId: '$_id',
                                totalCommands: 1,
                                uniqueCommands: { $size: '$uniqueCommands' },
                                commandDiversity: {
                                    $divide: [{ $size: '$uniqueCommands' }, '$totalCommands']
                                },
                                firstUse: 1,
                                lastUse: 1,
                                activeDays: {
                                    $size: {
                                        $setUnion: '$dailyUsage.date'
                                    }
                                },
                                dailyUsage: 1
                            }
                        },
                        { $sort: { totalCommands: -1 } }
                    ],
                    timePatterns: [
                        {
                            $group: {
                                _id: {
                                    hour: { $hour: '$timestamp' },
                                    dayOfWeek: { $dayOfWeek: '$timestamp' }
                                },
                                count: { $sum: 1 }
                            }
                        },
                        { $sort: { count: -1 } }
                    ],
                    commandPatterns: [
                        {
                            $group: {
                                _id: '$command',
                                totalUses: { $sum: 1 },
                                uniqueUsers: { $addToSet: '$userId' },
                                avgPerUser: { $avg: 1 }
                            }
                        },
                        {
                            $project: {
                                command: '$_id',
                                totalUses: 1,
                                uniqueUsers: { $size: '$uniqueUsers' },
                                avgPerUser: 1,
                                adoptionRate: {
                                    $divide: [
                                        { $size: '$uniqueUsers' },
                                        { $size: { $setUnion: '$uniqueUsers' } }
                                    ]
                                }
                            }
                        },
                        { $sort: { totalUses: -1 } }
                    ]
                }
            }
        ])

        const data = engagementData[0]
        const users = data.userActivity
        const timePatterns = data.timePatterns
        const commandPatterns = data.commandPatterns

        if (users.length === 0) {
            return interaction.editReply('目前沒有用戶參與度資料。')
        }

        // 計算參與度指標
        const totalUsers = users.length
        const totalCommands = users.reduce((sum, user) => sum + user.totalCommands, 0)
        const avgCommandsPerUser = Math.round(totalCommands / totalUsers)
        const avgUniqueCommands = Math.round(
            users.reduce((sum, user) => sum + user.uniqueCommands, 0) / totalUsers
        )
        const avgActiveDays = Math.round(
            users.reduce((sum, user) => sum + user.activeDays, 0) / totalUsers
        )

        // 用戶分層分析
        const powerUsers = users.filter((u) => u.totalCommands >= avgCommandsPerUser * 2)
        const regularUsers = users.filter(
            (u) => u.totalCommands >= avgCommandsPerUser && u.totalCommands < avgCommandsPerUser * 2
        )
        const casualUsers = users.filter((u) => u.totalCommands < avgCommandsPerUser)

        // 創建嵌入訊息
        const embed = new EmbedBuilder()
            .setTitle(`👥 ${title}`)
            .setColor(0xff6b6b)
            .setTimestamp()
            .setFooter({
                text: `分析期間: ${startDate.toLocaleDateString('zh-TW')} - ${endDate.toLocaleDateString('zh-TW')}`
            })

        // 基本參與度指標
        embed.addFields({
            name: '📊 參與度概覽',
            value: [
                `**總用戶數:** ${totalUsers.toLocaleString()}`,
                `**總指令數:** ${totalCommands.toLocaleString()}`,
                `**平均每用戶指令數:** ${avgCommandsPerUser}`,
                `**平均使用指令種類:** ${avgUniqueCommands}`,
                `**平均活躍天數:** ${avgActiveDays} 天`
            ].join('\n'),
            inline: true
        })

        // 用戶分層
        const userSegments = [
            {
                name: '🔥 重度用戶',
                users: powerUsers,
                emoji: '🔥',
                threshold: avgCommandsPerUser * 2
            },
            {
                name: '💪 活躍用戶',
                users: regularUsers,
                emoji: '💪',
                threshold: avgCommandsPerUser
            },
            { name: '😊 一般用戶', users: casualUsers, emoji: '😊', threshold: 0 }
        ]

        const segmentText = userSegments
            .map((segment) => {
                const percentage = Math.round((segment.users.length / totalUsers) * 100)
                return `${segment.emoji} **${segment.name}:** ${segment.users.length} 人 (${percentage}%)`
            })
            .join('\n')

        embed.addFields({
            name: '👥 用戶分層',
            value: segmentText,
            inline: true
        })

        // 最活躍用戶
        const topUsers = users
            .slice(0, 5)
            .map((user, index) => {
                const emoji = ['👑', '🥇', '🥈', '🥉', '4️⃣'][index] || '•'
                const diversity = Math.round(user.commandDiversity * 100)
                return `${emoji} <@${user.userId}> - **${user.totalCommands}** 指令 (${user.uniqueCommands} 種, ${diversity}% 多樣性)`
            })
            .join('\n')

        embed.addFields({
            name: '🏆 最活躍用戶',
            value: topUsers,
            inline: false
        })

        // 使用時間模式
        if (timePatterns.length > 0) {
            const topTimeSlots = timePatterns
                .slice(0, 5)
                .map((pattern) => {
                    const hour = pattern._id.hour
                    const dayOfWeek = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'][
                        pattern._id.dayOfWeek - 1
                    ]
                    return `${dayOfWeek} ${hour}:00 - ${pattern.count} 次`
                })
                .join('\n')

            embed.addFields({
                name: '⏰ 使用時間模式',
                value: `\`\`\`\n${topTimeSlots}\`\`\``,
                inline: true
            })
        }

        // 指令採用率分析
        if (commandPatterns.length > 0) {
            const adoptionAnalysis = commandPatterns
                .slice(0, 5)
                .map((cmd) => {
                    const adoptionRate = Math.round((cmd.uniqueUsers / totalUsers) * 100)
                    const avgPerUser = Math.round(cmd.avgPerUser * 10) / 10
                    return `\`${cmd.command}\`: ${adoptionRate}% 採用率, 平均 ${avgPerUser} 次/用戶`
                })
                .join('\n')

            embed.addFields({
                name: '📈 指令採用率',
                value: adoptionAnalysis,
                inline: true
            })
        }

        // 參與度健康度評估
        const healthScore = calculateEngagementHealth(users, totalUsers, avgCommandsPerUser)
        const healthLevel = getHealthLevel(healthScore)
        const healthEmoji = getHealthEmoji(healthScore)

        embed.addFields({
            name: '💚 參與度健康度',
            value: [
                `**健康分數:** ${healthScore}/100 ${healthEmoji}`,
                `**等級:** ${healthLevel}`,
                `**建議:** ${getHealthRecommendation(healthScore)}`
            ].join('\n'),
            inline: true
        })

        // 使用模式洞察
        const insights = generateEngagementInsights(users, timePatterns, commandPatterns)
        if (insights.length > 0) {
            embed.addFields({
                name: '💡 使用模式洞察',
                value: insights.join('\n'),
                inline: false
            })
        }

        await interaction.editReply({ embeds: [embed] })
    }
}

function calculateEngagementHealth(users: any[], totalUsers: number, avgCommands: number): number {
    let score = 0

    // 用戶活躍度 (40%)
    const activeUsers = users.filter((u) => u.totalCommands >= avgCommands).length
    const activityScore = Math.min((activeUsers / totalUsers) * 40, 40)
    score += activityScore

    // 指令多樣性 (30%)
    const avgDiversity = users.reduce((sum, user) => sum + user.commandDiversity, 0) / users.length
    const diversityScore = Math.min(avgDiversity * 30, 30)
    score += diversityScore

    // 持續使用 (30%)
    const avgActiveDays = users.reduce((sum, user) => sum + user.activeDays, 0) / users.length
    const consistencyScore = Math.min((avgActiveDays / 7) * 30, 30)
    score += consistencyScore

    return Math.round(score)
}

function getHealthLevel(score: number): string {
    if (score >= 80) return '🟢 優秀'
    if (score >= 60) return '🟡 良好'
    if (score >= 40) return '🟠 一般'
    return '🔴 需要改善'
}

function getHealthEmoji(score: number): string {
    if (score >= 80) return '💚'
    if (score >= 60) return '💛'
    if (score >= 40) return '🧡'
    return '❤️'
}

function getHealthRecommendation(score: number): string {
    if (score >= 80) return '保持現狀，用戶參與度良好'
    if (score >= 60) return '可考慮增加新功能吸引用戶'
    if (score >= 40) return '建議舉辦活動提升參與度'
    return '需要立即採取行動改善用戶體驗'
}

function generateEngagementInsights(
    users: any[],
    timePatterns: any[],
    commandPatterns: any[]
): string[] {
    const insights: string[] = []

    // 分析用戶行為模式
    const powerUsers = users.filter(
        (u) =>
            u.totalCommands >=
            (users.reduce((sum, u) => sum + u.totalCommands, 0) / users.length) * 2
    )
    const casualUsers = users.filter(
        (u) => u.totalCommands < users.reduce((sum, u) => sum + u.totalCommands, 0) / users.length
    )

    if (powerUsers.length / users.length > 0.2) {
        insights.push('🔥 發現大量重度用戶，社群黏性強')
    } else if (casualUsers.length / users.length > 0.6) {
        insights.push('💡 大部分用戶為輕度使用者，可考慮簡化操作')
    }

    // 分析時間模式
    if (timePatterns.length > 0) {
        const peakHour = timePatterns[0]._id.hour
        if (peakHour >= 9 && peakHour <= 17) {
            insights.push('⏰ 使用高峰在工作時間，符合辦公場景')
        } else if (peakHour >= 19 && peakHour <= 23) {
            insights.push('🌙 使用高峰在晚間，用戶習慣夜間使用')
        }
    }

    // 分析指令採用
    if (commandPatterns.length > 0) {
        const mostAdopted = commandPatterns[0]
        const adoptionRate = (mostAdopted.uniqueUsers / users.length) * 100

        if (adoptionRate > 80) {
            insights.push(`📈 \`${mostAdopted.command}\` 指令採用率極高，是核心功能`)
        } else if (adoptionRate < 30) {
            insights.push('⚠️ 大部分指令採用率偏低，可考慮功能優化')
        }
    }

    // 分析用戶多樣性
    const avgDiversity = users.reduce((sum, user) => sum + user.commandDiversity, 0) / users.length
    if (avgDiversity > 0.7) {
        insights.push('🎯 用戶指令使用多樣性高，功能豐富度良好')
    } else if (avgDiversity < 0.3) {
        insights.push('📝 用戶傾向使用少數核心指令，可考慮功能整合')
    }

    return insights
}
