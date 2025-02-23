const { model, Schema } = require('mongoose')

const blacklistGuildSchema = new Schema({
    Guild: String,
    Reason: String,
    Time: Number
})

// 加索引提高查詢效率
blacklistGuildSchema.index({ Guild: 1 })
blacklistGuildSchema.index({ Time: 1 })

module.exports = model('blacklist-guild', blacklistGuildSchema)
