const { model, Schema } = require('mongoose')

module.exports = model(
    'Anti-Alt',
    new Schema({
        GuildID: String,
        LogsChannel: String
    })
)
