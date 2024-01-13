const {
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const DB = require("../../../Structures/Schemas/AntiAlt");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("anti-alt")
    .setDescription("設置或重置日誌頻道")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((sub) =>
      sub
        .setName("setup")
        .setDescription("設置伺服器反小號日誌頻道")
        .addChannelOption((options) =>
          options
            .setName("channel")
            .setDescription("選擇將伺服器反小號日誌發送到的頻道")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub.setName("reset").setDescription("還原至初始設定")
    ),
  usage: "/anti-alt (setup, channel)",
};
