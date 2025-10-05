import { Schema, model } from 'mongoose'

const commandUsageSchema = new Schema({
    userId: { type: String, required: true },
    command: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
})

export default model('CommandUsage', commandUsageSchema)
