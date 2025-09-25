import { model, Schema } from 'mongoose'

const blacklistUserSchema = new Schema({
    User: String,
    Reason: String,
    Time: Number
})

blacklistUserSchema.index({ User: 1 })
blacklistUserSchema.index({ Time: 1 })

export default model('blacklist-user', blacklistUserSchema)
