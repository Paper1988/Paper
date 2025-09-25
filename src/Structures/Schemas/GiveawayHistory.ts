import mongoose from 'mongoose'

const giveawayHistorySchema = new mongoose.Schema(
    {
        guildId: { type: String, required: true },
        giveawayId: { type: String, required: true },
        prize: { type: String, required: true },
        hostedBy: { type: String, required: true },
        winners: { type: [String], default: [] },
        participantCount: { type: Number, required: true },
        endTime: { type: Date, required: true },
        requirements: {
            roles: [String],
            minAccountAge: Number,
            minServerTime: Number
        },
        createdAt: { type: Date, default: Date.now }
    },
    { timestamps: true }
)

giveawayHistorySchema.index({ guildId: 1, endTime: 1 })

export default mongoose.model('GiveawayHistory', giveawayHistorySchema)
