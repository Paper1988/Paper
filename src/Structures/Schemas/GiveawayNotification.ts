import mongoose from 'mongoose'

const giveawayNotificationSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    notifyStart: { type: Boolean, default: true },
    notifyEnd: { type: Boolean, default: true },
    notifyWin: { type: Boolean, default: true },
    notifyReminder: { type: Boolean, default: true }
})

export default mongoose.model('GiveawayNotification', giveawayNotificationSchema)
