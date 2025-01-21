const mongoose = require('mongoose')

const giveawaySchema = new mongoose.Schema({
    messageId: { type: String, required: true },
    channelId: { type: String, required: true },
    guildId: { type: String, required: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    ended: { type: Boolean, default: false },
    winnerCount: { type: Number, required: true },
    prize: { type: String, required: true },
    hostedBy: { type: String, required: true },
    participants: [String],
    winners: [String],
    description: String,
    requiredRoles: [String],
    blacklistedRoles: [String],
    minAccountAge: Number,
    minServerTime: Number,
    reminded: { type: Boolean, default: false }
})

module.exports = mongoose.model('Giveaway', giveawaySchema)
