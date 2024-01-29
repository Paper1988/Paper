const {
  EmbedBuilder,
  ChatInputCommandInteraction,
  Client,
} = require("discord.js");

module.exports = {
  subCommand: "giveaway.actions",
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  execute(interaction, client) {
    const errEmbed = new EmbedBuilder().setColor("Red");

    const successEmbed = new EmbedBuilder().setColor("Green");

    const choices = interaction.options.getString("options");
    const query = interaction.options.getString("query");
    const giveaway = client.giveawaysManager.giveaways.find((g) => g.guildId === interaction.guildId && g.messageId === query);

    if (!giveaway) {
      errEmbed.setDescription(
        `<:icons_warning:908958943466893323> | 無法找到訊息ID或獎品名稱: ${query}\n請確認有無輸入錯誤!`
      );
      interaction.reply({ embeds: [errEmbed], ephemeral: true });
    }

    switch (choices) {
      case "end":
        {
          client.giveawaysManager
            .end(query)
            .then(() => {
              successEmbed.setDescription("<:icons_xmarkwhite:988409378161954866> | 成功結束抽獎活動!");
              interaction.reply({ embeds: [successEmbed], ephemeral: true });
            })
            .catch((err) => {
              errEmbed.setDescription(`<:icons_warning:908958943466893323> | 發生錯誤: \n\`${err}\``);
              interaction.reply({ embeds: [errEmbed], ephemeral: true });
            });
        }
        break;
      case "pause":
        {
          client.giveawaysManager
            .pause(query)
            .then(() => {
              successEmbed.setDescription("<:icons_pause:861852632914198548> | 成功暫停抽獎活動!");
              interaction.reply({ embeds: [successEmbed], ephemeral: true });
            })
            .catch((err) => {
              errEmbed.setDescription(`<:icons_warning:908958943466893323> | 發生錯誤: \n\`${err}\``);
              interaction.reply({ embeds: [errEmbed], ephemeral: true });
            });
        }
        break;
      case "unpause":
        {
          client.giveawaysManager
            .unpause(query)
            .then(() => {
              successEmbed.setDescription("<:icons_play:861852632800952320> | 成功繼續進行抽獎活動!");
              interaction.reply({ embeds: [successEmbed], ephemeral: true });
            })
            .catch((err) => {
              errEmbed.setDescription(`<:icons_warning:908958943466893323> | 發生錯誤: \n\`${err}\``);
              interaction.reply({ embeds: [errEmbed], ephemeral: true });
            });
        }
        break;
      case "reroll":
        {
          client.giveawaysManager
            .reroll(query, {
              messages: {
                congrat:
                  "<:icons_tada:868022351508414474>恭喜新贏家: {winners}! 贏得獎品: **{this.prize}**!",
                error: "<:icons_outage:868122243845206087> | 無有效的參與, 於是沒有新贏家!",
              },
            })
            .then(() => {
              successEmbed.setDescription("<:icons_update:860123644297871382> | 成功重新抽選抽獎活動的贏家!");
              interaction.reply({ embeds: [successEmbed], ephemeral: true });
            })
            .catch((err) => {
              errEmbed.setDescription(`<:icons_warning:908958943466893323> | 發生錯誤: \n\`${err}\``);
              interaction.reply({ embeds: [errEmbed], ephemeral: true });
            });
        }
        break;
      case "delete":
        {
          client.giveawaysManager
            .delete(query)
            .then(() => {
              successEmbed.setDescription("<:icons_delete:867650498030731315> | 成功刪除抽獎活動!");
              interaction.reply({ embeds: [successEmbed], ephemeral: true });
            })
            .catch((err) => {
              errEmbed.setDescription(`<:icons_warning:908958943466893323> | 發生錯誤: \n\`${err}\``);
              interaction.reply({ embeds: [errEmbed], ephemeral: true });
            });
        }
        break;
    }
  },
};
