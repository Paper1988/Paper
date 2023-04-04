const { ChatInputCommandInteraction, Client } = require("discord.js");
const { loadCommands } = require("../../../Structures/Handlers/commandHandler.js");

module.exports = {
	subCommand: "reload.commands",
	/**
	 * @param {Client} client
	 * @param {ChatInputCommandInteraction} interaction
	 */
	execute(interaction, client) {
		loadCommands(client);
		interaction.reply({content: "> 成功載入Commands!", ephemeral: true});
	}
}