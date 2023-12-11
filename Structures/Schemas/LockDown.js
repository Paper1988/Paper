const { model, Schema } = require("mongoose");

module.exports = model(
  "LockDown",
  new Schema({
    GuildID: String,
    ChannelID: String,
    Time: String,
  })
);
