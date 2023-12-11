const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("從用戶或頻道中清除特定數量的訊息")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("all")
        .setDescription("移除所有訊息")
        .addIntegerOption((options) =>
          options
            .setName("count")
            .setDescription("請輸入數量")
            .setMinValue(1)
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("user")
        .setDescription("刪除特定用戶的所有消息")
        .addIntegerOption((options) =>
          options
            .setName("count")
            .setDescription("請輸入數量")
            .setMinValue(1)
            .setRequired(true)
        )
        .addUserOption((options) =>
          options.setName("user").setDescription("請選擇用戶").setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("bot")
        .setDescription("刪除特定機器人的所有訊息")
        .addIntegerOption((options) =>
          options
            .setName("count")
            .setDescription("請輸入數量")
            .setMinValue(1)
            .setRequired(true)
        )
    ),
};
