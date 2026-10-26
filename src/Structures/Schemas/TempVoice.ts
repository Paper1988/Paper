import { model, Schema } from 'mongoose'

const tempVoiceSchema = new Schema({
    GuildID: { type: String, required: true, unique: true },
    LobbyChannel: { type: String, required: true },
    CategoryID: { type: String, default: null },
    NameTemplate: { type: String, default: '{user} 的頻道' },
    UserLimit: { type: Number, default: 0 }
})

export default model('TempVoice', tempVoiceSchema)
