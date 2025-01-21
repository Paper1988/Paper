const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setNameLocalization('zh-TW', '清除訊息')
        .setNameLocalization('ja', 'メッセージをクリーンアップ')
        .setDescription('Clear messages from a user or channel')
        .setDescriptionLocalization('zh-TW', '從用戶或頻道中清除特定數量的訊息')
        .setDescriptionLocalization(
            'ja',
            'ユーザーまたはチャンネルから特定の数のメッセージをクリーンアップ'
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addSubcommand((subcommand) =>
            subcommand
                .setName('all')
                .setNameLocalization('zh-TW', '全部')
                .setNameLocalization('ja', 'すべて')
                .setDescription('Remove specified number of messages')
                .setDescriptionLocalization('zh-TW', '指定數量訊息移除')
                .setDescriptionLocalization('ja', '指定された数のメッセージを削除')
                .addIntegerOption((options) =>
                    options
                        .setName('count')
                        .setNameLocalization('zh-TW', '數量')
                        .setNameLocalization('ja', '数')
                        .setDescription('Please provide the number of messages to remove')
                        .setDescriptionLocalization('zh-TW', '請輸入數量')
                        .setDescriptionLocalization('ja', '数を入力してください')
                        .setMinValue(1)
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('user')
                .setNameLocalization('zh-TW', '用戶')
                .setNameLocalization('ja', 'ユーザー')
                .setDescription('Delete messages from a specific user')
                .setDescriptionLocalization('zh-TW', '特定用戶的訊息移除')
                .setDescriptionLocalization('ja', '特定ユーザーのメッセージを削除')
                .addIntegerOption((options) =>
                    options
                        .setName('count')
                        .setNameLocalization('zh-TW', '數量')
                        .setNameLocalization('ja', '数')
                        .setDescription('Please provide the number of messages to remove')
                        .setDescriptionLocalization('zh-TW', '請輸入數量')
                        .setDescriptionLocalization('ja', '数を入力してください')
                        .setMinValue(1)
                        .setRequired(true)
                )
                .addUserOption((options) =>
                    options
                        .setName('user')
                        .setNameLocalization('zh-TW', '用戶')
                        .setNameLocalization('ja', 'ユーザー')
                        .setDescription('請選擇用戶')
                        .setDescriptionLocalization('zh-TW', '請選擇用戶')
                        .setDescriptionLocalization('ja', 'ユーザーを選択してください')
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('bot')
                .setNameLocalization('zh-TW', '機器人')
                .setNameLocalization('ja', 'ボット')
                .setDescription('Delete messages from bots')
                .setDescriptionLocalization('zh-TW', '機器人的訊息移除')
                .setDescriptionLocalization('ja', 'ボットのメッセージを削除')
                .addIntegerOption((options) =>
                    options
                        .setName('count')
                        .setNameLocalization('zh-TW', '數量')
                        .setNameLocalization('ja', '数')
                        .setDescription('Please provide the number of messages to remove')
                        .setDescriptionLocalization('zh-TW', '請輸入數量')
                        .setDescriptionLocalization('ja', '数を入力してください')
                        .setMinValue(1)
                        .setRequired(true)
                )
        )
}
