import { model, Schema } from 'mongoose'

const antiAltSchema = new Schema({
    GuildID: String,
    LogsChannel: String
})

antiAltSchema.index({ GuildID: 1 })

export default model('Anti-Alt', antiAltSchema)
