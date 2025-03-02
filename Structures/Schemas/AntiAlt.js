const { model, Schema } = require('mongoose')

const antiAltSchema = new Schema({
    GuildID: String,
    LogsChannel: String
})

// 加索引提高查詢效率
antiAltSchema.index({ GuildID: 1 })

module.exports = model('Anti-Alt', antiAltSchema)
