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

    const role = interaction.options.getRole("role");
    const duration = interaction.options.getString("duration");
    const winnerCount = interaction.options.getInteger("winners");
    const prize = interaction.options.getString("prize");
    const gchannel = interaction.options.getChannel("channel") || interaction.channel;

    client.giveawaysManager
      .start(gchannel, {
        duration: ms(duration),
        winnerCount,
        prize,
        exemptMembers: new Function(
          "member",
          "giveaway",
          `return !member.roles.cache.some((r) => r.name === '${role}')`
        ),
        messages: {
          giveaway: "🎉**抽獎活動開始了**🎉",
          giveawayEnded: "🎊**抽獎活動結束了**🎊",
          inviteToParticipate: "**點擊🎉來參加抽獎!**",
          winMessage: "> 恭喜贏家 {winners} 贏得獎品: **`{this.prize}`** !",
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
          content: "⚠️ **這個抽獎活動已被暫停!** ⚠️",
          unpauseAfter: null,
          embedColor: "#FFFF00",
          infiniteDurationText: "`無限長`",
        },
        lastChance: {
          enabled: true,
          content: "⚠️ **最後加入的機會!** ⚠️",
          threshold: 10_000,
          embedColor: "#FF0000",
        },
      })
      .then(async () => {
        successEmbed.setDescription("抽獎活動成功開始!");
        return interaction.reply({ embeds: [successEmbed], ephemeral: true });
      })
      .catch((err) => {
        errEmbed.setDescription(`發生錯誤: \n\`${err}\``);
        return interaction.reply({ embeds: [errEmbed], ephemeral: true });
      });
  },
};
