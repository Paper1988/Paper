const { model, Schema } = require("mongoose");

module.exports = model(
    "Command-Toggle",
    new Schema({
        GuildID: String,
        Command: String,
    })
);