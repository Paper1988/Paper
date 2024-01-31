const { ChatInputCommandInteraction } = require("discord.js");
const DB = require("../../../Structures/Schemas/AntiAlt");

module.exports = {
  subCommand: "anti-alt.reset",
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const options = interaction.options;
    const { guild } = interaction;

    const LogsReset = new EmbedBuilder()
      .setDescription("<:correct_859388130411282442:1201843648229294121> | 成功重置日誌頻道")
      .setColor("#43b581");
    DB.deleteMany({ GuildID: guild.id }, async (err, data) => {
      if (err) throw err;
      if (!data)
        return interaction.reply({
          content: "<:warning_908958943466893323:1201844340276862976> | 找不到數據可刪除",
        });
      interaction.reply({ embeds: [LogsReset] });
    });
  },
};
