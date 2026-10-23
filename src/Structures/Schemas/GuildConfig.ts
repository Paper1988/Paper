import { Document, Schema, model } from 'mongoose'

export interface IGuildConfig extends Document {
    guildId: string
    disabledCommands: string[]
    moderatorLogChannel?: string | null
}

const GuildConfigSchema = new Schema<IGuildConfig>({
    guildId: { type: String, required: true, unique: true },
    disabledCommands: { type: [String], default: [] },
    moderatorLogChannel: { type: String, default: null }
})

export default model<IGuildConfig>('GuildConfig', GuildConfigSchema)
