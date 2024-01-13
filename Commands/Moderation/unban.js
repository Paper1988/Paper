const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("解除封鎖一名成員")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false)
    .addUserOption((options) =>
      options.setName("target").setDescription("選擇一個成員").setRequired(true)
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options, guild, member } = interaction;
    const target = options.getMember("target");

    await interaction.guild.bans.fetch().then(async (bans) => {
      if (bans.size == 0)
        return await interaction.reply({
          content: "該名成員沒有被封鎖",
          ephermeral: true,
        });
      let BannedID = bans.find((ban) => ban.user.id == target);
      if (!BannedID)
        return await interaction.reply({
          content: "指定的ID未被此伺服器封鎖",
          ephermeral: true,
        });

      interaction.guild.bans.remove(target, reason).catch((err) => {
        interaction.reply({
          content: "",
          ephermeral: true,
        });
        return console.log("錯誤發生 - 在Unban.js", err);
      });
    });

    target.ban().catch((err) => {
      interaction.reply({
        content: "",
        ephermeral: true,
      });
      return console.log("錯誤發生 - 在Unban.js", err);
    });

    const successEmbed = new EmbedBuilder()
      .setAuthor({
        name: `Unban`,
        iconURL: guild.iconURL(),
      })
      .setColor("Green")
      .setDescription(
        [`被解除封鎖的成員: ${target}`, `執行者: ${member}`].join(
          "\n"
        )
      )
      .setFooter({
        iconURL: guild.iconURL(),
        text: `機器人 | ${interaction.user.username}`,
      });
    return interaction.reply({ embeds: [successEmbed] });
  },
};
