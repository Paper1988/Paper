const { EmbedBuilder, ChatInputCommandInteraction } = require("discord.js");
const DB = require("../../../../Structures/Schemas/AFKSystem");

module.exports = {
  subCommand: "afk.return",
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, user } = interaction;

    const Embed = new EmbedBuilder().setAuthor({
      name: user.tag,
      iconURL: user.displayAvatarURL()
    });

    await DB.deleteOne({ GuildID: guild.id, UserID: user.id });

    Embed.setColor("Red").setDescription(`<:correct_859388130411282442:1201843648229294121> | 你的afk狀態已被移除`);
    return interaction.reply({ embeds: [Embed], ephemeral: true });
  },
};
