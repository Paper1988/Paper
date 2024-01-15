const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const DB = require("../../../Structures/Schemas/AntiScamDB");
const config = require("../../../Structures/config.json");

module.exports = {
  subCommand: "antiscam.reset",
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const options = interaction.options;
    const { guild } = interaction;

    DB.findOne({ Guild: guild.id }, async (err, data) => {
      if (!data)
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("⚠ | 反釣魚連結系統尚未被設定!")
              .setColor("Red"),
          ],
          ephemeral: true,
        });

      data.delete();
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setDescription("✅ | 您的反釣魚連結系統已重置!"),
        ],
        ephemeral: true,
      });
    });
  },
};
