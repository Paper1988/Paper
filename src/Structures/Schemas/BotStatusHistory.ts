import { Schema, model } from 'mongoose'

const botStatusHistorySchema = new Schema(
    {
        timestamp: { type: Date, required: true, index: true },
        status: { type: Number, required: true, enum: [0, 1] }
    },
    {
        versionKey: false,
        collection: 'botStatusHistory'
    }
)

// Keep enough history for troubleshooting without unbounded collection growth.
botStatusHistorySchema.index({ timestamp: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 })

export default model('BotStatusHistory', botStatusHistorySchema)
