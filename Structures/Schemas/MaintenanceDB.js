const { model, Schema } = require('mongoose')

module.exports = model(
    'MaintenanceDB',
    new Schema({
        ClientId: Number,
        Description: String,
        Maintenance: Boolean
    })
)
