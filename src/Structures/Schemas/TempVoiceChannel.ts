import { model, Schema } from 'mongoose'

const tempVoiceChannelSchema = new Schema({
    GuildID: { type: String, required: true },
    ChannelID: { type: String, required: true, unique: true },
	OwnerID: { type: String, required: true },
    PanelMessageID: { type: String, default: null }
})

tempVoiceChannelSchema.index({ GuildID: 1 })

export default model('TempVoiceChannel', tempVoiceChannelSchema)
