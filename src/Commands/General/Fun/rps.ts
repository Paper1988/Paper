import { RockPaperScissors } from 'discord-gamecord'
import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('rock-paper-scissors')
        .setNameLocalization('zh-TW', '剪刀石頭布')
        .setNameLocalization('ja', 'グー-チョキ-パー')
        .setDescription('Play Rock-Paper-Scissors with another member!')
        .setDescriptionLocalization('zh-TW', '和另一名成員遊玩剪刀石頭布!')
        .setDescriptionLocalization('ja', '他のユーザーとグー、チョキ、パーを遊びます!')
        .addUserOption((option) =>
            option
                .setName('opponent')
                .setNameLocalization('zh-TW', '對手')
                .setNameLocalization('ja', '相手')
                .setDescription('Please select your opponent')
                .setDescriptionLocalization('zh-TW', '請選擇你的對手')
                .setDescriptionLocalization('ja', '相手を選択してください')
                .setRequired(true)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const { options } = interaction
        const opponent = options.getUser('opponent')!

        if (interaction.user.id === opponent.id) {
            return await interaction.reply({
                content: '<:warning:1265562532857380936> | 你不能跟自己玩剪刀石頭布!',
                flags: MessageFlags.Ephemeral
            })
        }

        const Game = new RockPaperScissors({
            message: interaction,
            isSlashGame: true,
            opponent: opponent,
            embed: {
                title: '剪刀石頭布',
                color: '#5865F2',
                description: '請點選下面的按鈕來出拳',
                requestTitle: '遊戲邀請',
                rejectTitle: '邀請取消'
            },
            buttons: {
                rock: '石頭',
                paper: '布',
                scissors: '剪刀',
                accept: '接受',
                reject: '拒絕'
            },
            emojis: {
                rock: '🌑',
                paper: '📄',
                scissors: '✂️'
            },
            mentionUser: true,
            timeoutTime: 60000,
            buttonStyle: 'PRIMARY',
            pickMessage: '你選擇了 {emoji}',
            winMessage: '**{player}** 贏了這場遊戲!',
            tieMessage: '平手! 沒有贏家!',
            timeoutMessage: '這場遊戲沒有結束，沒有贏家!',
            playerOnlyMessage: '只有 {player} 還有 {opponent} 可以使用這些按鈕!',
            requestMessage: '{player} 邀請你與他遊玩`剪刀石頭布`',
            rejectMessage: '該用戶拒絕你的邀約',
            reqTimeoutMessage: '遊戲取消，因為 {opponent} 未回應'
        })

        await Game.startGame()
    }
}
