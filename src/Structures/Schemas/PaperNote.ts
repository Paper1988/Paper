import mongoose from 'mongoose'

const noteSchema = new mongoose.Schema({
    noteId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, maxlength: 200 },
    content: { type: String, maxlength: 10000 },
    type: {
        type: String,
        enum: ['text', 'image'],
        required: true,
        index: true
    },
    tags: [{ type: String, maxlength: 50 }],
    metadata: {
        filename: String,
        fileSize: Number,
        contentType: String,
        storageUrl: String,
        thumbnailUrl: String
    },
    createdAt: { type: Date, default: Date.now, index: true }
})

noteSchema.index({
    content: 'text',
    title: 'text',
    tags: 'text'
})

noteSchema.index({ noteId: 1, userId: 1, createdAt: -1 })
noteSchema.index({ noteId: 1, userId: 1, type: 1 })

export default mongoose.model('PaperNote', noteSchema)
