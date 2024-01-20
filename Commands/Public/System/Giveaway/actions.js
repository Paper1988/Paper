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
    const giveaway =
			client.giveawaysManager.giveaways.find(
      (g) => g.guildId === interaction.guildId && g.query === query) ||
			client.giveawaysManager.giveaways.find((g) => g.guildId === interaction.guildId && g.prize === query);

    if (!giveaway) {
      errEmbed.setDescription(`⚠ | 無法找到訊息ID或獎品名稱: ${query}\n  請確認有無輸入錯誤!`);
      interaction.reply({ embeds: [errEmbed], ephemeral: true });
    }

    switch (choices) {
      case "end":
        {
          client.giveawaysManager
            .end(query)
            .then(() => {
              successEmbed.setDescription("成功結束抽獎活動!");
              interaction.reply({ embeds: [successEmbed], ephemeral: true });
            }).catch((err) => {
              errEmbed.setDescription(`發生錯誤: \n\`${err}\``);
              interaction.reply({ embeds: [errEmbed], ephemeral: true });
            });
        }
        break;
      case "pause":
        {
          client.giveawaysManager
            .pause(query)
            .then(() => {
              successEmbed.setDescription("成功暫停抽獎活動!");
              interaction.reply({ embeds: [successEmbed], ephemeral: true });
            })
            .catch((err) => {
              errEmbed.setDescription(`發生錯誤: \n\`${err}\``);
              interaction.reply({ embeds: [errEmbed], ephemeral: true });
            });
        }
        break;
      case "unpause":
        {
          client.giveawaysManager
            .unpause(query)
            .then(() => {
              successEmbed.setDescription("成功繼續進行抽獎活動!");
              interaction.reply({ embeds: [successEmbed], ephemeral: true });
            })
            .catch((err) => {
              errEmbed.setDescription(`發生錯誤: \n\`${err}\``);
              interaction.reply({ embeds: [errEmbed], ephemeral: true });
            });
        }
        break;
      case "reroll":
        {
          client.giveawaysManager
            .reroll(query)
            .then(() => {
              successEmbed.setDescription("成功重新抽選抽獎活動的贏家!");
              interaction.reply({ embeds: [successEmbed], ephemeral: true });
            })
            .catch((err) => {
              errEmbed.setDescription(`發生錯誤: \n\`${err}\``);
              interaction.reply({ embeds: [errEmbed], ephemeral: true });
            });
        }
        break;
      case "delete":
        {
          client.giveawaysManager
            .delete(query)
            .then(() => {
              successEmbed.setDescription("成功刪除抽獎活動!");
              interaction.reply({ embeds: [successEmbed], ephemeral: true });
            })
            .catch((err) => {
              errEmbed.setDescription(`發生錯誤: \n\`${err}\``);
              interaction.reply({ embeds: [errEmbed], ephemeral: true });
            });
        }
        break;
    }
  },
};
