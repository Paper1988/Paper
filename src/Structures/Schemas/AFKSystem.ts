import { model, Schema } from 'mongoose'

const afkSchema = new Schema({
    GuildID: String,
    UserID: String,
    Status: String,
    Time: String
})

afkSchema.index({ GuildID: 1, UserID: 1 })

export default model('AFK', afkSchema)
