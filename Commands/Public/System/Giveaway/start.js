const {
  EmbedBuilder,
  ChatInputCommandInteraction,
  Client,
} = require("discord.js");
const ms = require("ms");

module.exports = {
  subCommand: "giveaway.start",
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  execute(interaction, client) {
    const errEmbed = new EmbedBuilder().setColor("Red");

    const successEmbed = new EmbedBuilder().setColor("Green");

    const duration = interaction.options.getString("duration");
    const winnerCount = interaction.options.getInteger("winners") || 1;
    const prize = interaction.options.getString("prize");
    const gchannel = interaction.options.getChannel("channel") || interaction.channel;

    client.giveawaysManager
      .start(gchannel, {
        duration: ms(duration),
        winnerCount,
        prize,
        messages: {
          giveaway: "<:tada_868022351508414474:1201844318940442624>**抽獎活動開始了**<:tada_868022351508414474:1201844318940442624>",
          giveawayEnded: "🎊**抽獎活動結束了**🎊",
          inviteToParticipate: "**點擊🎉來參加抽獎!**",
          winMessage: "<:tada_868022351508414474:1201844318940442624>恭喜贏家 {winners} 贏得獎品: **`{this.prize}`** !\n{this.messageURL}",
          noWinner: "抽獎活動已取消，因為: `參與人數不足`",
          dropMessage: "成為第一位參加的人!",
          drawing: "剩餘時間: {timestamp}",
          winners: "贏家:",
          endedAt: "結束時間",
          hostedBy: "舉辦人: {this.hostedBy}",
          embedFooter: "{this.winnerCount}位贏家",
        },
        pauseOptions: {
          isPaused: false,
          content: "<:warning_908958943466893323:1201844340276862976> **這個抽獎活動已被暫停!** <:warning_908958943466893323:1201844340276862976>",
          unpauseAfter: null,
          embedColor: "#FFFF00",
          infiniteDurationText: "`無限長`",
        },
        lastChance: {
          enabled: true,
          content: "<:warning_908958943466893323:1201844340276862976> **最後加入的機會!** <:warning_908958943466893323:1201844340276862976>",
          threshold: 10_000,
          embedColor: "#FF0000",
        },
      })
      .then(async () => {
        successEmbed.setDescription("<:correct_859388130411282442:1201843648229294121> | 抽獎活動成功開始!");
        return interaction.reply({ embeds: [successEmbed], ephemeral: true });
      })
      .catch((err) => {
        errEmbed.setDescription(`<:warning_908958943466893323:1201844340276862976> | 發生錯誤: \n\`${err}\``);
        return interaction.reply({ embeds: [errEmbed], ephemeral: true });
      });
  },
};
