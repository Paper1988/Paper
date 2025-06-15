import mongoose from 'mongoose'
import type { IGiveaway } from '../../../types/giveaway'

const giveawaySchema = new mongoose.Schema<IGiveaway>(
    {
        messageId: { type: String, required: true },
        channelId: { type: String, required: true },
        guildId: { type: String, required: true },
        startAt: { type: Date, required: true },
        endAt: { type: Date, required: true },
        ended: { type: Boolean, default: false },
        winnerCount: { type: Number, required: true },
        prize: { type: String, required: true },
        hostedBy: { type: String, required: true },
        participants: { type: [String], default: [] },
        winners: { type: [String], default: [] },
        description: String,
        requiredRoles: [String],
        blacklistedRoles: [String],
        minAccountAge: { type: Number, default: 0 },
        minServerTime: { type: Number, default: 0 },
        reminded: { type: Boolean, default: false }
    },
    { timestamps: true }
)

giveawaySchema.index({ guildId: 1, endAt: 1 })

export default mongoose.model<IGiveaway>('Giveaway', giveawaySchema)
