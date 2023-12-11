const { model, Schema } = require("mongoose");

module.exports = model(
  "AntiScamDB",
  new Schema({
    Guild: String,
    Channel: String,
  })
);
