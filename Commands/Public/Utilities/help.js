const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("顯示完整的指令列表"),
  async execute(interaction) {
    const helpmenu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("menu")
        .setPlaceholder("選擇一個分類")
        .addOptions(
          {
            label: "🔧功能",
            description: "顯示所有功能指令",
            value: "menu1",
          },

          {
            label: "🔒管理",
            description: "顯示所有管理指令(只有管理員和版主等人可以使用)",
            value: "menu2",
          },

          {
            label: "🎶音樂",
            description: "顯示所有音樂指令",
            value: "menu3",
          },

          {
            label: "🎁抽獎",
            description: "顯示所有抽獎指令",
            value: "menu4",
          },

          {
            label: "🎭 娛樂",
            description: "顯示所有娛樂指令",
            value: "menu5",
          }
        )
    );

    const generalcommands = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("back")
        .setLabel("返回")
        .setStyle(ButtonStyle.Primary)
    );

    const inviteme = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("邀請我")
        .setStyle(ButtonStyle.Link)
        .setURL(
          "https://discord.com/api/oauth2/authorize?client_id=869166906765103135&permissions=1644971945463&scope=bot%20applications.commands"
        )
    );

    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle("指令幫助")
      .setDescription(
        "Paper📄是一個多功能機器人，有許多指令，像是：音樂、抽獎、管理以及更多有趣的指令等你來發現！"
      )
      .setTimestamp();

    const publicem = new EmbedBuilder()
      .setTitle("🔧一般 General")
      .setColor("Green")
      .setDescription(
        "> </help:1131066238915842059>: 顯示這個列表\n> </botinfo:1131066238915842060>: 顯示有關Paper的資訊\n> </ping:1131066238777426001>: Pong!\n> </invite:1131066238915842058>: 顯示Paper的邀請指令\n> </serverinfo:1131066238777426000>: 顯示伺服器的資訊\n> </userinfo:1131066238777425998>: 取得一位用戶的資訊\n> </report:1158752288928710706>: 回報給我們bug、建議\n> </credits:1202478482316329031>: 檢視版權資訊\n> </mcstats:1202453198078738525>: 顯示一個Minecraft伺服器的資訊\n> </say:1203269049610539089>: 讓機器人代替你說話"
      )
      .setTimestamp();

    const modem = new EmbedBuilder()
      .setTitle("🔒管理 Moderation")
      .setColor("Red")
      .setDescription(
        "> `/ban`: 停權一名成員\n> `/unban`: 解除停權一名成員\n> `/kick`: 踢出一名成員\n> `/timeout`: 禁言一名成員\n> `/purge`: 刪除頻道內訊息\n> `/voice-move`: 移動語音頻道內成員至另一語音頻道\n> \`/role\`: 編輯成員的身分組"
      )
      .setTimestamp();

    const musicem = new EmbedBuilder()
      .setTitle("🎶音樂 Music")
      .setColor("Purple")
      .setDescription(
        "> `/play`: 提供連結或關鍵字來播放音樂或影片\n> `/seek`: 調整音樂當前秒數\n> `/settings`: 設定功能\n> `/volume`: 調整音量\n> \`/filters\`: 增添/刪除音樂過濾器\n> \`/jump\`: 跳到清單中的歌曲位置"
      )
      .setTimestamp();

    const giveem = new EmbedBuilder()
      .setTitle("🎁抽獎 Giveaway")
      .setColor("Gold")
      .setDescription(
        "> `/start`: 設定一次抽獎活動\n> `/actions`: 設定抽獎活動(結束、暫停、繼續、重抽、刪除)\n> \`/edit\`: 重新設定參數(時間、獎品等)"
      )
      .setTimestamp();

    const funem = new EmbedBuilder()
      .setTitle("🎭娛樂 Fun")
      .setColor("Orange")
      .setDescription(
        "> `/anime`: 搜尋動漫資訊\n> `/bite`: 咬某人一口(gif)\n> `/dance`: 挑一支舞(gif)\n> `/hug`: 擁抱某人(gif)\n> `/kill`: 殺掉某人(gif)\n> `/kiss`: 親某人一口(gif)\n> `/pat`: 摸某人一下(gif)\n> `/punch`: 揍某人一拳(gif)\n> \`/rock-paper-scissors\`: 邀請某人遊玩剪刀石頭布"
      )
      .setTimestamp();

    const message = await interaction.reply({
      embeds: [embed],
      components: [helpmenu, inviteme],
    });

    const collector = await message.createMessageComponentCollector();

    collector.on(`collect`, async (i) => {
      if (i.customId === "menu") {
        const value = i.values[0];
        if (i.user.id !== interaction.user.id) {
          return await i.reply({
            content: `<:warning_908958943466893323:1201844340276862976> | 只有 ${interaction.user.tag} 才能使用這個選單!`,
            ephemeral: true,
          });
        }
        if (value === "menu1") {
          await i.update({
            embeds: [publicem],
            components: [helpmenu, inviteme, generalcommands],
          });
        }

        if (value === "menu2") {
          await i.update({
            embeds: [modem],
            components: [helpmenu, inviteme, generalcommands],
          });
        }

        if (value === "menu3") {
          await i.update({
            embeds: [musicem],
            components: [helpmenu, inviteme, generalcommands],
          });
        }

        if (value === "menu4") {
          await i.update({
            embeds: [giveem],
            components: [helpmenu, inviteme, generalcommands],
          });
        }

        if (value === "menu5") {
          await i.update({
            embeds: [funem],
            components: [helpmenu, inviteme, generalcommands],
          });
        }
      }

      if (i.customId === "back") {
        if (i.user.id !== interaction.user.id) {
          return await i.reply({
            content: `<:warning_908958943466893323:1201844340276862976> | 只有 ${interaction.user.tag} 可以使用這些按鈕!`,
            ephemeral: true,
          });
        }
        await i.update({ embeds: [embed], components: [helpmenu, inviteme] });
      }
    });
  },
};
