const { ChatInputCommandInteraction, Client } = require("discord.js");
const DB = require("../../../Structures/Schemas/AntiScamDB");
const config = require("../../../Structures/config.json");

module.exports = {
  subCommand: "antiscam.reset",
  /**
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const options = interaction.options;
    const { guild } = interaction;

    DB.findOne({ Guild: guild.id }, async (err, data) => {
      if (!data)
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("AntiScam 系統未設定")
              .setColor("Red"),
          ],
          ephemeral: true,
        });

      data.delete();
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription("您的 AntiScam 系統已重置"),
        ],
        ephemeral: true,
      });
    });
  },
};
