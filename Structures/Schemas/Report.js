const { model, Schema } = require('mongoose')

const BugReportSchema = new Schema({
    userId: String,
    createdAt: Date
})

BugReportSchema.index({ userId: 1, createdTimestamp: 1 })

module.exports = model('BugReport', BugReportSchema)
