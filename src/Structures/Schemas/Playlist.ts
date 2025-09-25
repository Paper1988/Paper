import { Schema, model } from 'mongoose'

const playlistSchema = new Schema(
    {
        userId: { type: String, required: true },
        name: { type: String, required: true },
        songs: [
            {
                title: String,
                url: String,
                duration: Number,
                thumbnail: String,
                addedAt: { type: Date, default: Date.now }
            }
        ],
        createdAt: { type: Date, default: Date.now },
        isPrivate: { type: Boolean, default: false },
        description: String,
        plays: { type: Number, default: 0 }
    },
    {
        timestamps: true
    }
)

playlistSchema.index({ userId: 1, name: 1 }, { unique: true })

export default model('Playlist', playlistSchema)
