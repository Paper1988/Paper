const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  developer: true,
  data: new SlashCommandBuilder()
    .setName("reload")
    .setDescription("重新載入你的指令/事件")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((options) =>
      options.setName("events").setDescription("載入Events")
    )
    .addSubcommand((options) =>
      options.setName("commands").setDescription("載入Commands")
    ),
};
