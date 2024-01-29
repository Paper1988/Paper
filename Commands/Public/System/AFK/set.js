const { EmbedBuilder, ChatInputCommandInteraction } = require("discord.js");
const DB = require("../../../../Structures/Schemas/AFKSystem");

module.exports = {
  subCommand: "afk.set",
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, options, user, createdTimestamp } = interaction;

    const Embed = new EmbedBuilder().setAuthor({
      name: user.tag,
      iconURL: user.displayAvatarURL({ dynamic: true }),
    });

    const afkStatus = options.getString("status");

    await DB.findOneAndUpdate(
      { GuildID: guild.id, UserID: user.id },
      { Status: afkStatus, Time: parseInt(createdTimestamp / 1000) },
      { new: true, upsert: true }
    );

    Embed.setColor("Green").setDescription(
      `✅ | 你的afk狀態已被設置為: \`${afkStatus}\``
    );
    return interaction.reply({ embeds: [Embed], ephemeral: true });
  },
};
