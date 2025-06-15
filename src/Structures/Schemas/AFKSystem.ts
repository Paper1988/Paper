import { model, Schema } from 'mongoose'

const afkSchema = new Schema({
    GuildID: String,
    UserID: String,
    Status: String,
    Time: String
})

// 加索引提高查詢效率
afkSchema.index({ GuildID: 1, UserID: 1 })

export default model('AFK', afkSchema)
