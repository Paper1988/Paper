import { model, Schema } from 'mongoose'

const musicSchema = new Schema({
    GuildID: String,
    DJRoleID: { type: String, default: null },
    volume: { type: Number, default: 50 },
    autoplay: { type: Boolean, default: false },
    repeatMode: { type: Number, default: 0 }
})

musicSchema.index({ GuildID: 1 })

export default model('Music', musicSchema)
