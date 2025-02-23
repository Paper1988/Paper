const { model, Schema } = require('mongoose')

const blacklistUserSchema = new Schema({
    User: String,
    Reason: String,
    Time: Number
})

// 加索引提高查詢效率
blacklistUserSchema.index({ User: 1 })
blacklistUserSchema.index({ Time: 1 })

module.exports = model('blacklist-user', blacklistUserSchema)
