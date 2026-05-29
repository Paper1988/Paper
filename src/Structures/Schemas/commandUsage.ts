import { Schema, model } from 'mongoose'

const commandUsageSchema = new Schema({
    userId: { type: String, required: true },
    command: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
})

commandUsageSchema.index({ timestamp: 1 })
commandUsageSchema.index({ timestamp: 1, command: 1 })
commandUsageSchema.index({ timestamp: 1, userId: 1 })

export default model('CommandUsage', commandUsageSchema)
