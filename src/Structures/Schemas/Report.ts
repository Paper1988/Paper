import { model, Schema } from 'mongoose'

const BugReportSchema = new Schema({
    userId: String,
    createdAt: Date
})

BugReportSchema.index({ userId: 1, createdTimestamp: 1 })

export default model('BugReport', BugReportSchema)
