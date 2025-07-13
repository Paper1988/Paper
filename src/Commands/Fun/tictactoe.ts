import { TicTacToe } from 'discord-gamecord'
import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('tic-tac-toe')
        .setNameLocalization('zh-TW', '圈圈叉叉')
        .setNameLocalization('ja', '三目並べ')
        .setDescription('Play Tic Tac Toe with another member!')
        .setDescriptionLocalization('zh-TW', '和另一位成員遊玩圈圈叉叉!')
        .setDescriptionLocalization('ja', '他のメンバーと三目並べをプレイします!')
        .addUserOption((options) =>
            options
                .setName('user')
                .setNameLocalization('zh-TW', '用戶')
                .setNameLocalization('ja', 'ユーザー')
                .setDescription('Please choose a user to be your opponent')
                .setDescriptionLocalization('zh-TW', '請選擇一名用戶來當你的對手')
                .setDescriptionLocalization('ja', '対戦相手となるユーザーを選択してください')
                .setRequired(true)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        if (interaction.user.id === interaction.options.getUser('user')!.id) {
            return await interaction.reply({
                content: '<:warning:1265562532857380936> | 你不能跟自己玩圈圈叉叉!',
                flags: MessageFlags.Ephemeral
            })
        }

        const Game = new TicTacToe({
            message: interaction,
            isSlashGame: true,
            opponent: interaction.options.getUser('user'),
            embed: {
                title: '圈圈叉叉',
                color: '#5865F2',
                overTitle: '遊戲結束',
                requestTitle: '遊戲邀請',
                rejectTitle: '邀請取消'
            },
            emojis: {
                xButton: '❎',
                oButton: '⭕',
                blankButton: '➖'
            },
            buttons: {
                accept: '接受',
                reject: '拒絕'
            },
            mentionUser: true,
            timeoutTime: 60000,
            xButtonStyle: 'DANGER',
            oButtonStyle: 'PRIMARY',
            turnMessage: '{emoji} | 現在是 **{player}** 的回合',
            winMessage: '{emoji} | **{player}** 贏了',
            tieMessage: '遊戲平手，沒有人獲勝!',
            timeoutMessage: '請求回應超時',
            playerOnlyMessage: '只有 {player} 和 {opponent} 可以使用這些按鈕!',
            requestMessage: '{player} 邀請你與他遊玩`圈圈叉叉`',
            rejectMessage: '該用戶拒絕你的邀約',
            reqTimeoutMessage: '遊戲取消，因為 {opponent} 未回應'
        })

        await Game.startGame()
    }
}
