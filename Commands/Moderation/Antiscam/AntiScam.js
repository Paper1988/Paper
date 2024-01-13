const {
  PermissionFlagsBits,
  SlashCommandBuilder,
  Client,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("antiscam")
    .setDescription("設定反釣魚連結系統")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((sub) =>
      sub
        .setName("setup")
        .setDescription("防釣魚系統設定")
        .addChannelOption((options) =>
          options
            .setName("logs")
            .setDescription("記錄釣魚訊息")
            .setRequired(true)
        )
    )
    .addSubcommand((options) =>
      options.setName("reset").setDescription("重置你的反釣魚連結系統")
    ),
  usage: "/antiscam [setup/reset]",
};
