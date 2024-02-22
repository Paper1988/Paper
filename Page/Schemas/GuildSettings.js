const { model, Schema } = require("mongoose");

module.exports = model(
	"GuildSettings",
	new Schema({
		GuildId: String,
	})
);