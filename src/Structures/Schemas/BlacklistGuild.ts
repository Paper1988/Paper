import { model, Schema } from 'mongoose'

const blacklistGuildSchema = new Schema({
    Guild: String,
    Reason: String,
    Time: Number
})

blacklistGuildSchema.index({ Guild: 1 })
blacklistGuildSchema.index({ Time: 1 })

export default model('blacklist-guild', blacklistGuildSchema)
