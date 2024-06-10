const { model, Schema } = require('mongoose')

module.exports = model(
    'MaintenanceDB',
    new Schema({
        Maintenance: Boolean
    })
)
