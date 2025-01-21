const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setNameLocalization('zh-TW', 'afk')
        .setNameLocalization('ja', 'afk')
        .setDescription('AFK system')
        .setDescriptionLocalization('zh-TW', '一個afk系統')
        .setDescriptionLocalization('ja', 'afkシステム')
        .addSubcommand((sub) =>
            sub
                .setName('set')
                .setNameLocalization('zh-TW', '設定')
                .setNameLocalization('ja', '設定')
                .setDescription('Enter the AFK status')
                .setDescriptionLocalization('zh-TW', '進入afk狀態')
                .setDescriptionLocalization('ja', 'afk状態に入ります')
                .addStringOption((options) =>
                    options
                        .setName('status')
                        .setNameLocalization('zh-TW', '狀態')
                        .setNameLocalization('ja', 'ステータス')
                        .setDescription('Set your status')
                        .setDescriptionLocalization('zh-TW', '設定你的狀態')
                        .setDescriptionLocalization('ja', 'ステータスを設定してください')
                        .setRequired(true)
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName('return')
                .setNameLocalization('zh-TW', '返回')
                .setNameLocalization('ja', '戻る')
                .setDescription('Exit the AFK status')
                .setDescriptionLocalization('zh-TW', '退出afk狀態')
                .setDescriptionLocalization('ja', 'afk状態を退出します')
        ),
    usage: '/afk (set, return)'
}
