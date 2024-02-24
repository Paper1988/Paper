const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  Client
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("ping").setDescription("Pong!").setDMPermission(false),
  usage: "/ping",
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    await interaction.reply({ content: `Pong!\n${client.ws.ping}`, ephemeral: true });
  },
};
