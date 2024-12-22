const mongoose = require('mongoose');

const giveawayHistorySchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    giveawayId: { type: String, required: true },
    prize: { type: String, required: true },
    hosterId: { type: String, required: true },
    winners: [String],
    participantCount: { type: Number, required: true },
    endTime: { type: Date, required: true },
    requirements: {
        roles: [String],
        minAccountAge: Number,
        minServerTime: Number
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GiveawayHistory', giveawayHistorySchema); 