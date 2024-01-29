const {
	SlashCommandBuilder,
} = require("discord.js");

module.exports = {
	developer: true,
	data: new SlashCommandBuilder()
		.setName("blacklist")
		.setDescription("黑名單指令")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("user")
				.setDescription("封鎖用戶")
				.addStringOption((options) =>
					options
						.setName("user-id")
						.setDescription("輸入使用者的ID")
						.setRequired(true)
				)
				.addStringOption((options) =>
					options.setName("reason").setDescription("輸入原因")
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("guild")
				.setDescription("封鎖一個伺服器")
				.addStringOption((options) =>
					options
						.setName("guild-id")
						.setDescription("輸入伺服器的ID")
						.setRequired(true)
				)
				.addStringOption((options) =>
					options.setName("reason").setDescription("輸入原因")
				)
		),
};
