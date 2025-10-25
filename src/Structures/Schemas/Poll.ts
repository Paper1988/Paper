import mongoose from 'mongoose'
import { type PollDoc, PollType } from '@/typings/meeting.js'

const pollOptionSchema = new mongoose.Schema(
    {
        id: { type: String, required: true },
        text: { type: String, required: true, maxlength: 100 }
    },
    { _id: false }
)

const pollVoteSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        choice: { type: Boolean }, // for yes/no polls
        optionIds: { type: [String] }, // for multi-choice polls
        ranking: { type: [String] } // for ranked polls - array of option IDs in rank order
    },
    { _id: false }
)

const pollSchema = new mongoose.Schema<PollDoc>(
    {
        pollId: { type: String, required: true, unique: true },
        meetingId: { type: String },
        agendaItemId: { type: String },
        type: {
            type: String,
            enum: Object.values(PollType),
            required: true
        },

        options: {
            type: [pollOptionSchema],
            default: [],
            validate: {
                validator: function (options: any[]) {
                    return options.length <= 25
                },
                message: '投票選項不能超過 25 個'
            }
        },
        votes: { type: [pollVoteSchema], default: [] },

        isClosed: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
        endsAt: { type: Date },
        messageId: { type: String } // for standalone poll messages
    },
    {
        timestamps: true,
        collection: 'polls'
    }
)

// Indexes for performance
pollSchema.index({ pollId: 1 })
pollSchema.index({ meetingId: 1 })
pollSchema.index({ agendaItemId: 1 })
pollSchema.index({ isClosed: 1, endsAt: 1 })

// TTL index for auto-cleanup of ended polls after 7 days
pollSchema.index(
    { endsAt: 1 },
    {
        expireAfterSeconds: 7 * 24 * 60 * 60, // 7 days in seconds
        partialFilterExpression: {
            $and: [{ endsAt: { $exists: true } }, { isClosed: true }]
        }
    }
)

// Ensure unique votes per user per poll
pollSchema.index({ pollId: 1, 'votes.userId': 1 }, { unique: true, sparse: true })

// Validation
pollSchema.pre('save', function () {
    // Validate votes based on poll type
    for (const vote of this.votes) {
        switch (this.type) {
            case PollType.YES_NO:
                if (vote.choice === undefined) {
                    throw new Error('是非投票必須有明確的選擇')
                }
                if (vote.optionIds || vote.ranking) {
                    throw new Error('是非投票不應包含選項ID或排序')
                }
                break

            case PollType.MULTIPLE_CHOICE:
                if (!vote.optionIds || vote.optionIds.length === 0) {
                    throw new Error('多選投票必須選擇至少一個選項')
                }
                if (vote.choice !== undefined || vote.ranking) {
                    throw new Error('多選投票不應包含是非選擇或排序')
                }
                break

            case PollType.RANKED:
                if (!vote.ranking || vote.ranking.length === 0) {
                    throw new Error('排序投票必須提供排序')
                }
                if (vote.choice !== undefined || vote.optionIds) {
                    throw new Error('排序投票不應包含是非選擇或選項ID')
                }
                break
        }
    }
})

export default mongoose.model<PollDoc>('Poll', pollSchema)
