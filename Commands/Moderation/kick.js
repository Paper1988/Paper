const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("將成員踢出伺服器")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false)
    .addUserOption((options) =>
      options
        .setName("target")
        .setDescription("選擇一名目標成員")
        .setRequired(true)
    )
    .addStringOption((options) =>
      options.setName("reason").setDescription("請提供原因").setMaxLength(512)
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options, guild, member } = interaction;

    const target = options.getMember("target");
    const reason = options.getString("reason") || "無指定";

    const errorsArray = [];

    const dmEmbed = new EmbedBuilder()
      .setColor("Green")
      .setDescription(
        [
          `你已被伺服器 ${guild.name} **踢出**`,
          `操作者: ${member}`,
          `\n原因: ${reason}`,
        ].join("\n")
      )

    const errorsEmbed = new EmbedBuilder()
      .setAuthor({
        name: "<:warning_908958943466893323:1201844340276862976> | 無法踢出該名成員，因為",
      })
      .setColor("Red");

    if (!target)
      return interaction.reply({
        embeds: [errorsEmbed.setDescription("所選成員很可能已經離開伺服器了")],
        ephemeral: true,
      });

    if (!target.kickable)
      errorsArray.push("我的權限不夠大!");

    if (member.roles.highest.position < target.roles.highest.position)
      errorsArray.push("所選成員的權限比你高!");

    if (errorsArray.length)
      return interaction.reply({
        embeds: [errorsEmbed.setDescription(errorsArray.join("\n"))],
        ephemeral: true,
      });

    target.send({ embeds: [dmEmbed] });
    target.kick({ reason: reason }).catch((err) => {
      interaction.reply({
        embeds: [
          errorsEmbed.setDescription("<:warning_908958943466893323:1201844340276862976> | 發生一個不常見的錯誤，無法踢出成員"),
        ],
      });
      return console.log("錯誤發生 - 在Kick.js", err);
    });

    const successEmbed = new EmbedBuilder()
      .setColor("Green")
      .setDescription(
        [
          `被踢出成員: ${target}`,
          `操作者: ${member}`,
          `\n原因: ${reason}`,
        ].join("\n")
      )

    return interaction.reply({ embeds: [successEmbed] });
  },
};
