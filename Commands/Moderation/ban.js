const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const ms = require("ms");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("封鎖一名成員")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false)
    .addUserOption((options) =>
      options.setName("target").setDescription("選擇一個成員").setRequired(true)
    )
    .addStringOption((options) =>
      options
        .setName("reason")
        .setDescription("請提供理由")
        .setMaxLength(512)
        .setRequired(true)
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options, guild, member } = interaction;

    const target = options.getMember("target");
    const reason = options.getString("reason");

    const errorsArray = [];

    const dmEmbed = new EmbedBuilder()
      .setAuthor({
        name: `<:icons_ban:859424400968646676>`,
        iconURL: guild.iconURL(),
      })
      .setColor("Green")
      .setDescription(
        [
          `你已從 ${interaction.guild.name} 被 **封鎖**`,
          `執行者: ${member}`,
          `\n原因: ${reason}`,
        ].join("\n")
      )
      .setFooter({
        iconURL: guild.iconURL(),
        text: `機器人 | ${interaction.user.username}`,
      });

    const errorsEmbed = new EmbedBuilder()
      .setAuthor({
        name: "<:icons_warning:908958943466893323> | 無法封鎖該名成員，因為",
      })
      .setColor("Red");

    if (!target)
      return interaction.reply({
        embeds: [errorsEmbed.setDescription("成員很可能已經離開伺服器了")],
        ephermeral: true,
      });

    if (!target.manageable || !target.moderatable)
      errorsArray.push("所選的目標成員無法由機器人管理(我的權限不夠大!)");

    if (member.roles.highest.postion < target.roles.highest.postion)
      errorsArray.push("所選的目標成員權限比你高!");

    if (errorsArray.length)
      return interaction.reply({
        embeds: [errorsEmbed.setDescription(errorsArray.join("\n"))],
        ephermeral: true,
      });

    target.send({ embeds: [dmEmbed] });
    target.ban({ reason: reason }).catch((err) => {
      interaction.reply({
        embeds: [
          errorsEmbed.setDescription("<:icons_warning:908958943466893323> | 無法封鎖該名成員，因為一個罕見的錯誤"),
        ],
      });
      return console.log("錯誤發生 - 在 Ban.js", err);
    });

    const successEmbed = new EmbedBuilder()
      .setAuthor({
        name: `<:icons_ban:859424400968646676>`,
        iconURL: guild.iconURL(),
      })
      .setColor("Green")
      .setDescription(
        [
          `被封鎖的成員: ${target}`,
          `執行者: ${member}`,
          `\n原因: ${reason}`,
        ].join("\n")
      )
      .setFooter({
        iconURL: guild.iconURL(),
        text: `機器人 | ${interaction.user.username}`,
      });
    return interaction.reply({ embeds: [successEmbed] });
  },
};
