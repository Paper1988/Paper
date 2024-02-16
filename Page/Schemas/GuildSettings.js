const { model, Schema } = require("mongoose");

module.exports = model(
	"GuildSettings",
	new Schema({
		Guild: String,
		Reason: String,
		Time: Number,
	})
);