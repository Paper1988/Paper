const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("role-editor")
    .setDescription("管理用戶的身分組")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("提供要添加或刪除的身分組")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("提供要管理的用戶")
        .setRequired(false)
    ),
  usage: "/role (role, user)",
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options } = interaction;
    const role = options.getRole("role");
    const target = options.getMember("target") || interaction.member;

    const embed = new EmbedBuilder()
      .setColor(
        `#${interaction.guild.roles.cache.get(role.id).color.toString(16)}`
      )
      .setTitle("🎭 身分組管理 🎭");

    if (!role.editable || role.position === 0) {
      embed.setDescription(`<:warning_908958943466893323:1201844340276862976> | 我無法編輯身分組: **${role}** !`);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    embed.setDescription(
      target.roles.cache.has(role.id)
        ? `<:correct_859388130411282442:1201843648229294121> | 成功從 ${target} 身上移除 **${role}**`
        : `<:correct_859388130411282442:1201843648229294121> | 成功添加身分組: **${role}** 至 ${target} 身上`
    );
    target.roles.cache.has(role.id)
      ? target.roles.remove(role)
      : target.roles.add(role);
    const message = await interaction.reply({
      embeds: [embed],
      fetchReply: true,
    });
    setTimeout(() => message.delete().catch(() => {}), 5000);
  },
};
