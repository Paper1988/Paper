const { SlashCommandBuilder, ChatInputCommandInteraction } = require("discord.js");
const { RockPaperScissors } = require("discord-gamecord");

module.exports = {
  data: new SlashCommandBuilder()
  .setName("rock-paper-scissors")
  .setDescription("和另一名成員遊玩剪刀石頭布!")
  .addUserOption((option) => 
    option
      .setName("opponent")
      .setDescription("選擇你的對手")
      .setRequired(true)
  ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options } = interaction;
    const opponent = options.getUser("opponent");

    const Game = new RockPaperScissors({
        message: interaction,
        isSlashGame: true,
        opponent: opponent,
        embed: {
            title: "剪刀石頭布",
            color: '#5865F2',
            description: "請點選下面的按鈕來出拳",
            requestTitle: '遊戲邀請',
            rejectTitle: '邀請取消',
        },
        buttons: {
            rock: "石頭",
            paper: "布",
            scissors: "剪刀",
            accept: '接受',
            reject: '拒絕'
        },
        emojis: {
            rock: "🌑",
            paper: "🧾",
            scissors: "✂️",
        },
        mentionUser: true,
        timeoutTime: 60000,
        buttonStyle: "PRIMARY",
        pickMessage: '你選擇了 {emoji}',
        winMessage: '**{plyer}** 贏了這場遊戲!',
        tieMessage: "平手! 沒有贏家!",
        timeoutMessage: "這場遊戲沒有結束，沒有贏家!",
        playerOnlyMessage: "只有 {player} 還有 {opponent} 可以使用這些按鈕!",
        requestMessage: '{player} 邀請你參與一場遊戲',
        rejectMessage: '該用戶拒絕你的邀約',
        reqTimeoutMessage: '遊戲取消，因為用戶未回應'
    });

    Game.startGame();
  }
}