const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("ping").setDescription("Pong!"),
  usage: "/ping",
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  execute(interaction) {
    interaction.reply("Pong!");
  },
};
