import Poll from '@/Structures/Schemas/Poll.js'
import { type PollDoc, PollType, type PollOption, type PollVote } from '@/typings/meeting.js'
import { generateId } from '@/libs/meeting/utils.js'
import { safeDbOperation } from '@/libs/utils/dbHealthCheck.js'

export class PollRepository {
    // ==================== Poll CRUD Operations ====================

    /**
     * Create a new poll
     */
    static async createPoll(data: {
        meetingId?: string
        agendaItemId?: string
        type: PollType
        options?: Omit<PollOption, 'id'>[] // For multi-choice and ranked polls
        endsAt?: Date
        messageId?: string
    }): Promise<PollDoc | null> {
        const result = await safeDbOperation(async () => {
            const pollId = generateId(12)

            let options: PollOption[] = []

            // For yes/no polls, create default yes/no options
            if (data.type === PollType.YES_NO) {
                options = [
                    { id: 'yes', text: '是' },
                    { id: 'no', text: '否' }
                ]
            } else if (data.options) {
                // For multi-choice and ranked polls, use provided options
                options = data.options.map((option) => ({
                    id: generateId(8),
                    ...option
                }))
            }

            const poll = new Poll({
                pollId,
                ...data,
                options,
                votes: [],
                isClosed: false,
                createdAt: new Date()
            })

            return await poll.save()
        })
        return result ?? null
    }

    /**
     * Get poll by ID
     */
    static async getPollById(pollId: string): Promise<PollDoc | null> {
        const result = await safeDbOperation(async () => {
            return await Poll.findOne({ pollId })
        })
        return result ?? null
    }

    /**
     * Get polls by meeting ID
     */
    static async listPollsByMeeting(meetingId: string): Promise<PollDoc[]> {
        const result = await safeDbOperation(async () => {
            return await Poll.find({ meetingId }).sort({ createdAt: 1 })
        }, [])
        return result ?? []
    }

    /**
     * Get polls by agenda item ID
     */
    static async getPollsByAgendaItem(agendaItemId: string): Promise<PollDoc[]> {
        const result = await safeDbOperation(async () => {
            return await Poll.find({ agendaItemId }).sort({ createdAt: 1 })
        }, [])
        return result ?? []
    }

    // ==================== Vote Operations ====================

    /**
     * Cast or update a vote (upsert operation)
     */
    static async upsertVote(
        pollId: string,
        userId: string,
        vote: Omit<PollVote, 'userId'>
    ): Promise<PollDoc | null> {
        const result = await safeDbOperation(async () => {
            // First check if poll exists and is not closed
            const poll = await Poll.findOne({ pollId, isClosed: false })
            if (!poll) return null

            // Validate vote based on poll type
            if (!this.validateVote(poll.type, vote)) {
                throw new Error('投票格式不符合投票類型要求')
            }

            // Remove existing vote if any
            await Poll.updateOne({ pollId }, { $pull: { votes: { userId } } })

            // Add new vote
            const newVote: PollVote = { userId, ...vote }

            return await Poll.findOneAndUpdate(
                { pollId },
                { $push: { votes: newVote } },
                { returnDocument: 'after' }
            )
        })
        return result ?? null
    }

    /**
     * Remove a user's vote
     */
    static async removeVote(pollId: string, userId: string): Promise<PollDoc | null> {
        const result = await safeDbOperation(async () => {
            return await Poll.findOneAndUpdate(
                { pollId, isClosed: false },
                { $pull: { votes: { userId } } },
                { returnDocument: 'after' }
            )
        })
        return result ?? null
    }

    /**
     * Close a poll
     */
    static async closePoll(pollId: string): Promise<PollDoc | null> {
        const result = await safeDbOperation(async () => {
            return await Poll.findOneAndUpdate(
                { pollId },
                { $set: { isClosed: true } },
                { returnDocument: 'after' }
            )
        })
        return result ?? null
    }

    /**
     * Close expired polls (for cleanup job)
     */
    static async closeExpiredPolls(): Promise<number> {
        const result = await safeDbOperation(async () => {
            const now = new Date()
            const updateResult = await Poll.updateMany(
                {
                    isClosed: false,
                    endsAt: { $lt: now }
                },
                { $set: { isClosed: true } }
            )

            return updateResult.modifiedCount
        }, 0)
        return result ?? 0
    }

    /**
     * Get user's vote for a poll
     */
    static async getUserVote(pollId: string, userId: string): Promise<PollVote | null> {
        const result = await safeDbOperation(async () => {
            const poll = await Poll.findOne({ pollId })
            if (!poll) return null

            return poll.votes.find((vote) => vote.userId === userId) || null
        })
        return result ?? null
    }

    /**
     * Get vote count for a poll
     */
    static async getVoteCount(pollId: string): Promise<number> {
        const result = await safeDbOperation(async () => {
            const poll = await Poll.findOne({ pollId })
            return poll?.votes.length || 0
        }, 0)
        return result ?? 0
    }

    /**
     * Update poll message ID (for tracking Discord message)
     */
    static async updateMessageId(pollId: string, messageId: string): Promise<PollDoc | null> {
        const result = await safeDbOperation(async () => {
            return await Poll.findOneAndUpdate({ pollId }, { $set: { messageId } }, { returnDocument: 'after' })
        })
        return result ?? null
    }

    // ==================== Utility Methods ====================

    /**
     * Validate vote based on poll type
     */
    private static validateVote(pollType: PollType, vote: Omit<PollVote, 'userId'>): boolean {
        switch (pollType) {
            case PollType.YES_NO:
                return (
                    vote.choice !== undefined &&
                    vote.optionIds === undefined &&
                    vote.ranking === undefined
                )

            case PollType.MULTIPLE_CHOICE:
                return (
                    vote.optionIds !== undefined &&
                    vote.optionIds.length > 0 &&
                    vote.choice === undefined &&
                    vote.ranking === undefined
                )

            case PollType.RANKED:
                return (
                    vote.ranking !== undefined &&
                    vote.ranking.length > 0 &&
                    vote.choice === undefined &&
                    vote.optionIds === undefined
                )

            default:
                return false
        }
    }

    /**
     * Check if user has already voted
     */
    static async hasUserVoted(pollId: string, userId: string): Promise<boolean> {
        const result = await safeDbOperation(async () => {
            const poll = await Poll.findOne({ pollId })
            return poll?.votes.some((vote) => vote.userId === userId) || false
        }, false)
        return result ?? false
    }

    /**
     * Get active polls (not closed and not expired)
     */
    static async getActivePolls(meetingId?: string): Promise<PollDoc[]> {
        const result = await safeDbOperation(async () => {
            const now = new Date()
            const query: any = {
                isClosed: false,
                $or: [{ endsAt: { $gt: now } }, { endsAt: { $exists: false } }]
            }

            if (meetingId) {
                query.meetingId = meetingId
            }

            return await Poll.find(query).sort({ createdAt: -1 })
        }, [])
        return result ?? []
    }

    /**
     * Get polls that need cleanup (ended and older than TTL)
     */
    static async getPollsForCleanup(): Promise<PollDoc[]> {
        const result = await safeDbOperation(async () => {
            const sevenDaysAgo = new Date()
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

            return await Poll.find({
                isClosed: true,
                endsAt: { $lt: sevenDaysAgo }
            })
        }, [])
        return result ?? []
    }

    /**
     * Delete old polls (for cleanup)
     */
    static async deleteOldPolls(): Promise<number> {
        const result = await safeDbOperation(async () => {
            const sevenDaysAgo = new Date()
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

            const deleteResult = await Poll.deleteMany({
                isClosed: true,
                endsAt: { $lt: sevenDaysAgo }
            })

            return deleteResult.deletedCount || 0
        }, 0)
        return result ?? 0
    }

    /**
     * Get polls that are expiring (past their endsAt time but not yet closed)
     */
    static async getExpiringPolls(currentTime: Date): Promise<PollDoc[]> {
        const result = await safeDbOperation(async () => {
            return await Poll.find({
                isClosed: false,
                endsAt: { $exists: true, $lte: currentTime }
            })
        }, [])
        return result ?? []
    }

    /**
     * Get meeting channel ID for a meeting
     */
    static async getMeetingChannelId(meetingId: string): Promise<string | null> {
        const result = await safeDbOperation(async () => {
            // Import Meeting model to avoid circular dependency
            const Meeting = (await import('@/Structures/Schemas/Meeting.js')).default
            const meeting = await Meeting.findOne({ meetingId })
            return meeting?.channelId || null
        })
        return result ?? null
    }
}

export default PollRepository
