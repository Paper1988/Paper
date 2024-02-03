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

    if ((interaction.user.id) === opponent.id) return interaction.reply({ content: "<:warning_908958943466893323:1201844340276862976> | 你不能跟自己玩剪刀石頭布!", ephemeral: true });

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
            paper: "📄",
            scissors: "✂️",
        },
        mentionUser: true,
        timeoutTime: 60000,
        buttonStyle: "PRIMARY",
        pickMessage: '你選擇了 {emoji}',
        winMessage: '**{player}** 贏了這場遊戲!',
        tieMessage: "平手! 沒有贏家!",
        timeoutMessage: "這場遊戲沒有結束，沒有贏家!",
        playerOnlyMessage: "只有 {player} 還有 {opponent} 可以使用這些按鈕!",
        requestMessage: '{player} 邀請你與他遊玩\`剪刀石頭布\`',
        rejectMessage: '該用戶拒絕你的邀約',
        reqTimeoutMessage: '遊戲取消，因為 {opponent} 未回應'
    });

    Game.startGame();
  }
}