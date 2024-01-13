const { ChatInputCommandInteraction, Client } = require("discord.js");
const DB = require("../../../Structures/Schemas/AntiScamDB");
const config = require("../../../Structures/config.json");

module.exports = {
  subCommand: "antiscam.logs",
  /**
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const options = interaction.options;
    const { guild } = interaction;

    const log = options.getChannel("logs");
    DB.findOne({ Guild: guild.id }, async (err, data) => {
      if (data) data.delete();
      new DB({
        Guild: interaction.guild.id,
        Channel: log.id,
      }).save();
      interaction.reply({
        content: "> 反釣魚連結系統已設定完畢!",
        ephemeral: true,
      });
    });
  },
};
