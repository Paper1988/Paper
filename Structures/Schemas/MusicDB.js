const { model, Schema } = require('mongoose')

const musicSchema = new Schema({
    GuildID: String,
    volume: { type: Number, default: 50 },
    autoplay: { type: Boolean, default: false },
    repeatMode: { type: Number, default: 0 }
})

// 加索引提高查詢效率
musicSchema.index({ GuildID: 1 })

module.exports = model('Music', musicSchema)
