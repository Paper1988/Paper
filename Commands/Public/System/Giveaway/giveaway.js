const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");;

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
        .addIntegerOption((options) =>
          options
            .setName("winners")
            .setDescription("請提供這個抽獎活動的贏家數量")
            .setRequired(true)
        )
        .addStringOption((options) =>
          options
            .setName("prizes")
            .setDescription("請提供這個抽獎活動的獎品")
            .setRequired(true)
        )
        .addChannelOption((options) =>
          options
            .setName("channel")
            .setDescription("選擇這個抽獎活動舉辦的頻道")
            .setRequired(false)
        )
				.addRoleOption((options) =>
					options
						.setName("role")
						.setDescription("選擇需要擁有才能參加抽獎的身分組")
						.setRequired(false)
				)
    )
    .addSubcommand((sub) =>
      sub
        .setName("actions")
        .setDescription("控制抽獎活動的選項")
        .addStringOption((options) =>
          options
            .setName("options")
            .setDescription("請選擇一項控制選項")
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
            .setDescription("請提供抽獎活動的訊息ID或獎品名稱")
            .setRequired(true)
        )
    ),
  usage: "/giveaway (start, actions)",
};
