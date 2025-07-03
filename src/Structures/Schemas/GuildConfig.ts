import { Document, Schema, model } from 'mongoose'

export interface IGuildConfig extends Document {
    guildId: string
    disabledCommands: string[]
}

const GuildConfigSchema = new Schema<IGuildConfig>({
    guildId: { type: String, required: true, unique: true },
    disabledCommands: { type: [String], default: [] }
})

export default model<IGuildConfig>('GuildConfig', GuildConfigSchema)
