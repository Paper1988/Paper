import { Schema, model } from 'mongoose'

const botStatusHistorySchema = new Schema(
    {
        timestamp: { type: Date, required: true },
        status: { type: Number, required: true, enum: [0, 1] }
    },
    {
        versionKey: false,
        collection: 'botStatusHistory'
    }
)

botStatusHistorySchema.index({ timestamp: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 })

export default model('BotStatusHistory', botStatusHistorySchema)
