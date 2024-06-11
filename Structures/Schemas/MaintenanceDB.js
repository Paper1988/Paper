const mongoose = require('mongoose')

module.exports = mongoose.model(
    'MaintenanceDB',
    new mongoose.Schema({
        ClientId: mongoose.Mixed,
        Description: String,
        Maintenance: String
    })
)
