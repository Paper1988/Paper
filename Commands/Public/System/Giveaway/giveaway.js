const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway")
    .setDescription("一個基本的抽獎系統")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((sub) =>
      sub
        .setName("start")
        .setDescription("開始一個抽獎活動")
        .addStringOption((options) =>
          options
            .setName("duration")
            .setDescription(
              "請為這個抽獎活動提供時間(例如: 10d 2h 30m [翻譯: 10天 2小時 30分鐘])"
            )
            .setRequired(true)
        )
        .addStringOption((options) =>
          options
            .setName("prize")
            .setDescription("請提供獎品")
            .setRequired(true)
        )
        .addIntegerOption((options) =>
          options
            .setName("winners")
            .setDescription("請提供贏家數量(預設為1)")
            .setRequired(false)
        )
        .addChannelOption((options) =>
          options
            .setName("channel")
            .setDescription("選擇舉辦的頻道")
            .setRequired(false)
        )
        .addRoleOption((options) =>
          options
            .setName("role")
            .setDescription("選擇身分組")
            .setRequired(false)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("actions")
        .setDescription("控制選項")
        .addStringOption((options) =>
          options
            .setName("options")
            .setDescription("請選擇控制選項")
            .setRequired(true)
            .addChoices(
              {
                name: "結束",
                value: "end",
              },
              {
                name: "暫停",
                value: "pause",
              },
              {
                name: "繼續",
                value: "unpause",
              },
              {
                name: "重抽",
                value: "reroll",
              },
              {
                name: "刪除",
                value: "delete",
              }
            )
        )
        .addStringOption((options) =>
          options
            .setName("query")
            .setDescription("請提供訊息ID")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub.setName("edit")
        .setDescription("修改設定")
        .addStringOption((options) =>
          options
          .setName("query")
          .setDescription("請提供訊息ID")
          .setRequired(true)
        )
        .addStringOption((options) =>
          options
            .setName("new-duration")
            .setDescription("新的結束時間(相同格式)")
            .setRequired(false)
        )
        .addIntegerOption((options) =>
          options
            .setName("new-winners")
            .setDescription("新的贏家數量")
            .setRequired(false)
        )
        .addStringOption((options) =>
          options
            .setName("new-prizes")
            .setDescription("新的獎品")
            .setRequired(false)
        )
    ),
  usage: "/giveaway (start, actions)",
};
