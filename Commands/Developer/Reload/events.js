const { ChatInputCommandInteraction, Client } = require("discord.js");
const { loadEvents } = require("../../../Structures/Handlers/eventHandler");

module.exports = {
  subCommand: "reload.events",
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  execute(interaction, client) {
    for (const [key, value] of client.events)
      client.removeListener(`${key}`, value, true);
    loadEvents(client);
    interaction.reply({ content: "> 成功載入Events!", ephemeral: true });
  },
};
