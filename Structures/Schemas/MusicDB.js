const { model, Schema } = require("mongoose");

module.exports = model(
    "Music",
    new Schema({
        GuildID: String,
        volume: { type: Number, default: 50 },
        autoplay: { type: Boolean, default: false},
        repeatMode: { type: Number, default: 0 },
    })
);
