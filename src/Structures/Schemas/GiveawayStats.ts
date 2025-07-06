import mongoose from 'mongoose'

const giveawayStatsSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    totalGiveaways: { type: Number, default: 0 },
    activeGiveaways: { type: Number, default: 0 },
    totalPrizes: { type: Number, default: 0 },
    totalParticipants: { type: Number, default: 0 },
    totalWinners: { type: Number, default: 0 },
    mostActiveHoster: {
        userId: String,
        count: Number
    },
    mostWonUser: {
        userId: String,
        count: Number
    },
    lastUpdated: { type: Date, default: Date.now }
})

export default mongoose.model('GiveawayStats', giveawayStatsSchema)
