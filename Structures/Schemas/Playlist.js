const mongoose = require('mongoose')

const playlistSchema = new mongoose.Schema(
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

// 確保每個用戶的播放清單名稱是唯一的
playlistSchema.index({ userId: 1, name: 1 }, { unique: true })

module.exports = mongoose.model('Playlist', playlistSchema)
