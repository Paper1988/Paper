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
      .setColor("Green")
      .setTitle("<:ban_859424400968646676:1201843628108943390>")
      .setDescription(
        [
          `你已被伺服器 ${guild.name} **封鎖**`,
          `操作者: ${member}`,
          `\n原因: ${reason}`,
        ].join("\n")
      )
      .setFooter({
        iconURL: guild.iconURL(),
        text: `${guild.name}`,
      });

    const errorsEmbed = new EmbedBuilder()
      .setTitle("<:warning_908958943466893323:1201844340276862976> | 無法封鎖該名成員，因為")
      .setColor("Red");

    if (!target)
      return interaction.reply({
        embeds: [errorsEmbed.setDescription("所選成員很可能已經離開伺服器了")],
        ephemeral: true,
      });

    if (!target.banable)
      errorsArray.push("我的權限不夠大!");

    if (member.roles.highest.position < target.roles.highest.position)
      errorsArray.push("所選成員的權限比你高!");

    if (errorsArray.length)
      return interaction.reply({
        embeds: [errorsEmbed.setDescription(errorsArray.join("\n"))],
        ephemeral: true,
      });

    target.send({ embeds: [dmEmbed] });
    target.ban({ reason: reason }).catch((err) => {
      interaction.reply({
        embeds: [
          errorsEmbed.setDescription("發生一個罕見的錯誤"),
        ],
      });
      return console.log("錯誤發生 - 在 Ban.js", err);
    });

    const successEmbed = new EmbedBuilder()
      .setAuthor({
        name: `${guild.name}`,
        iconURL: guild.iconURL(),
      })
      .setColor("Green")
      .setDescription(
        [
          `被封鎖的成員: ${target}`,
          `操作者: ${member}`,
          `\n原因: ${reason}`,
        ].join("\n")
      )
    return interaction.reply({ embeds: [successEmbed] });
  },
};
