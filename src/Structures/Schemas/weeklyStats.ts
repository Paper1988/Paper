import { Schema, model } from 'mongoose'

const weeklyStatsSchema = new Schema({
    weekStart: { type: Date, required: true },
    activeUsers: { type: Number, required: true },
    topCommands: [
        {
            command: String,
            count: Number
        }
    ]
})

export default model('WeeklyStats', weeklyStatsSchema)
