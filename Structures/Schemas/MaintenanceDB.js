const { model, Schema } = require('mongoose')

module.exports = model(
    'MaintenanceDB',
    new Schema({
        ClientId: Number,
        Maintenance: Boolean
    })
)
