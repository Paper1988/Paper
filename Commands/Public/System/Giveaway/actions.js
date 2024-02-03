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
      // Search with giveaway prize
      client.giveawaysManager.giveaways.find((g) => g.guildId === interaction.guildId && g.prize === query) ||
      // Search with messageId
      client.giveawaysManager.giveaways.find((g) => g.guildId === interaction.guildId && g.messageId === query);

    if (!giveaway) {
      errEmbed.setDescription(
        `<:warning_908958943466893323:1201844340276862976> | 無法找到訊息ID: ${query}\n請確認有無輸入錯誤!`
      );
      interaction.reply({ embeds: [errEmbed], ephemeral: true });
    }

    switch (choices) {
      case "end":
        {
          client.giveawaysManager
            .end(query)
            .then(() => {
              successEmbed.setDescription("<:xmark_988409378161954866:1201844342029815848> | 成功結束抽獎活動!");
              interaction.reply({ embeds: [successEmbed], ephemeral: true });
            })
            .catch((err) => {
              errEmbed.setDescription(`<:warning_908958943466893323:1201844340276862976> | 發生錯誤: \n\`${err}\``);
              interaction.reply({ embeds: [errEmbed], ephemeral: true });
            });
        }
        break;
      case "pause":
        {
          client.giveawaysManager
            .pause(query)
            .then(() => {
              successEmbed.setDescription("<:pause_861852632914198548:1201843739728035961> | 成功暫停抽獎活動!");
              interaction.reply({ embeds: [successEmbed], ephemeral: true });
            })
            .catch((err) => {
              errEmbed.setDescription(`<:warning_908958943466893323:1201844340276862976> | 發生錯誤: \n\`${err}\``);
              interaction.reply({ embeds: [errEmbed], ephemeral: true });
            });
        }
        break;
      case "unpause":
        {
          client.giveawaysManager
            .unpause(query)
            .then(() => {
              successEmbed.setDescription("<:play_861852632800952320:1202112864857628692> | 成功繼續進行抽獎活動!");
              interaction.reply({ embeds: [successEmbed], ephemeral: true });
            })
            .catch((err) => {
              errEmbed.setDescription(`<:warning_908958943466893323:1201844340276862976> | 發生錯誤: \n\`${err}\``);
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
                  "<:tada_868022351508414474:1201844318940442624>恭喜新贏家: {winners}! 贏得獎品: **{this.prize}**!",
                error: "<:outage_868122243845206087:1202112862990897172> | 無有效的參與, 於是沒有新贏家!",
              },
            })
            .then(() => {
              successEmbed.setDescription("<:loop_861852632893227029:1201843696031764490> | 成功重新抽選抽獎活動的贏家!");
              interaction.reply({ embeds: [successEmbed], ephemeral: true });
            })
            .catch((err) => {
              errEmbed.setDescription(`<:warning_908958943466893323:1201844340276862976> | 發生錯誤: \n\`${err}\``);
              interaction.reply({ embeds: [errEmbed], ephemeral: true });
            });
        }
        break;
      case "delete":
        {
          client.giveawaysManager
            .delete(query)
            .then(() => {
              successEmbed.setDescription("<:delete_867650498030731315:1202218553109913700> | 成功刪除抽獎活動!");
              interaction.reply({ embeds: [successEmbed], ephemeral: true });
            })
            .catch((err) => {
              errEmbed.setDescription(`<:warning_908958943466893323:1201844340276862976> | 發生錯誤: \n\`${err}\``);
              interaction.reply({ embeds: [errEmbed], ephemeral: true });
            });
        }
        break;
    }
  },
};
