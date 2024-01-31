const { ChatInputCommandInteraction, Client } = require("discord.js");
const {
  loadCommands,
} = require("../../../Structures/Handlers/commandHandler.js");

module.exports = {
  subCommand: "reload.commands",
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  execute(interaction, client) {
    loadCommands(client);
    interaction.reply({ content: "<:correct_859388130411282442:1201843648229294121> | 成功載入Commands!", ephemeral: true });
  },
};
