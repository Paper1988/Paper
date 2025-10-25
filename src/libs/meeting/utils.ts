import {
    type PollDoc,
    type PollResults,
    PollType,
    type PollVote,
    type PollOption
} from '@/typings/meeting.js'

/**
 * Format duration in minutes to human readable string
 */
export function formatDuration(minutes: number): string {
    if (minutes < 60) {
        return `${minutes} 分鐘`
    }

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (remainingMinutes === 0) {
        return `${hours} 小時`
    }

    return `${hours} 小時 ${remainingMinutes} 分鐘`
}

/**
 * Format time remaining for timer display
 */
export function formatTimeRemaining(endsAt: Date): string {
    const now = new Date()
    const remaining = Math.max(0, endsAt.getTime() - now.getTime())

    if (remaining === 0) {
        return '已結束'
    }

    const minutes = Math.floor(remaining / (1000 * 60))
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000)

    if (minutes > 0) {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    return `${seconds} 秒`
}

/**
 * Create a progress bar string
 */
export function createProgressBar(current: number, total: number, length: number = 10): string {
    if (total === 0) return '⬜'.repeat(length)

    const filled = Math.round((current / total) * length)
    const empty = length - filled

    return '🟩'.repeat(filled) + '⬜'.repeat(empty)
}

/**
 * Generate a nanoid-style string for IDs
 */
export function generateId(length: number = 12): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''

    for (let i = 0; i < length; i++) {
        result += charset.charAt(Math.floor(Math.random() * charset.length))
    }

    return result
}

/**
 * Calculate poll results based on vote type
 */
export function calculatePollResults(poll: PollDoc): PollResults {
    const totalVotes = poll.votes.length

    if (totalVotes === 0) {
        return {
            totalVotes: 0,
            yesCount: 0,
            noCount: 0,
            optionResults: poll.options.map((option) => ({
                option,
                count: 0,
                percentage: 0
            })),
            rankedResults: poll.options.map((option, index) => ({
                option,
                score: 0,
                position: index + 1
            }))
        }
    }

    switch (poll.type) {
        case PollType.YES_NO:
            return calculateYesNoResults(poll.votes, totalVotes)

        case PollType.MULTIPLE_CHOICE:
            return calculateMultiChoiceResults(poll.votes, poll.options, totalVotes)

        case PollType.RANKED:
            return calculateRankedResults(poll.votes, poll.options, totalVotes)

        default:
            throw new Error(`Unknown poll type: ${poll.type}`)
    }
}

/**
 * Calculate yes/no poll results
 */
function calculateYesNoResults(votes: PollVote[], totalVotes: number): PollResults {
    const yesCount = votes.filter((vote) => vote.choice === true).length
    const noCount = votes.filter((vote) => vote.choice === false).length

    return {
        totalVotes,
        yesCount,
        noCount
    }
}

/**
 * Calculate multiple choice poll results
 */
function calculateMultiChoiceResults(
    votes: PollVote[],
    options: PollOption[],
    totalVotes: number
): PollResults {
    const optionCounts = new Map<string, number>()

    // Initialize counts
    options.forEach((option) => {
        optionCounts.set(option.id, 0)
    })

    // Count votes for each option
    votes.forEach((vote) => {
        if (vote.optionIds) {
            vote.optionIds.forEach((optionId) => {
                const currentCount = optionCounts.get(optionId) || 0
                optionCounts.set(optionId, currentCount + 1)
            })
        }
    })

    const optionResults = options
        .map((option) => {
            const count = optionCounts.get(option.id) || 0
            return {
                option,
                count,
                percentage: totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
            }
        })
        .sort((a, b) => b.count - a.count)

    const winner = optionResults[0] && optionResults[0].count > 0 ? optionResults[0].option : undefined

    return {
        totalVotes,
        optionResults,
        winner
    }
}

/**
 * Calculate ranked poll results using Borda count method
 */
function calculateRankedResults(
    votes: PollVote[],
    options: PollOption[],
    totalVotes: number
): PollResults {
    const optionScores = new Map<string, number>()

    // Initialize scores
    options.forEach((option) => {
        optionScores.set(option.id, 0)
    })

    // Calculate Borda count scores
    votes.forEach((vote) => {
        if (vote.ranking && vote.ranking.length > 0) {
            vote.ranking.forEach((optionId, index) => {
                // Higher position (lower index) gets more points
                const points = options.length - index
                const currentScore = optionScores.get(optionId) || 0
                optionScores.set(optionId, currentScore + points)
            })
        }
    })

    const rankedResults = options
        .map((option) => {
            const score = optionScores.get(option.id) || 0
            return {
                option,
                score,
                position: 0 // Will be set after sorting
            }
        })
        .sort((a, b) => b.score - a.score)

    // Assign positions
    rankedResults.forEach((result, index) => {
        result.position = index + 1
    })

    const winner = rankedResults[0] && rankedResults[0].score > 0 ? rankedResults[0].option : undefined

    return {
        totalVotes,
        rankedResults,
        winner
    }
}

/**
 * Validate that a ranking contains valid option IDs and is a proper permutation
 */
export function validateRanking(ranking: string[], validOptionIds: string[]): boolean {
    // Check if all IDs in ranking are valid
    if (!ranking.every((id) => validOptionIds.includes(id))) {
        return false
    }

    // Check for duplicates
    const uniqueIds = new Set(ranking)
    if (uniqueIds.size !== ranking.length) {
        return false
    }

    // Ranking can be partial (doesn't need to include all options)
    return true
}

/**
 * Format a date for display in Taiwan time zone
 */
export function formatDateTime(date: Date): string {
    return date.toLocaleString('zh-TW', {
        timeZone: 'Asia/Taipei',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
}

/**
 * Get relative time string (e.g., "in 2 hours", "3 minutes ago")
 */
export function getRelativeTime(date: Date): string {
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffMinutes = Math.floor(Math.abs(diffMs) / (1000 * 60))

    if (diffMs > 0) {
        // Future
        if (diffMinutes < 60) {
            return `${diffMinutes} 分鐘後`
        } else if (diffMinutes < 1440) {
            const hours = Math.floor(diffMinutes / 60)
            return `${hours} 小時後`
        } else {
            const days = Math.floor(diffMinutes / 1440)
            return `${days} 天後`
        }
    } else {
        // Past
        if (diffMinutes < 60) {
            return `${diffMinutes} 分鐘前`
        } else if (diffMinutes < 1440) {
            const hours = Math.floor(diffMinutes / 60)
            return `${hours} 小時前`
        } else {
            const days = Math.floor(diffMinutes / 1440)
            return `${days} 天前`
        }
    }
}

/**
 * Truncate text to fit within Discord embed limits
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
        return text
    }

    return text.substring(0, maxLength - 3) + '...'
}
