const {
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
} = require("discord.js");
const DB = require("../../../Structures/Schemas/AntiAlt");

module.exports = {
  subCommand: "anti-alt.setup",
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const options = interaction.options;
    const { guild } = interaction;

    const LogsChannel = options.getChannel("channel");

    await DB.findOneAndUpdate(
      { GuildID: guild.id },
      { LogsChannel: LogsChannel.id },
      {
        new: true,
        upsert: true
      }
    ).catch((err) => console.log(err));

    const LogsSetup = new EmbedBuilder()
      .setDescription("<:correct_859388130411282442:1201843648229294121> | 成功設定日誌")
      .setColor("#43b581");

    await guild.channels.cache
      .get(LogsChannel.id)
      .send({ embeds: [LogsSetup] })
      .then((m) => {
        setTimeout(() => {
          m.delete();
        }, 1 * 7500);
      });

    await interaction.reply({
      content: "<:correct_859388130411282442:1201843648229294121> | 完成!",
      ephemeral: true,
    });
  },
};
