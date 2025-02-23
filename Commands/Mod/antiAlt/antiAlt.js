const { PermissionFlagsBits, SlashCommandBuilder, ChannelType } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anti-alt')
        .setNameLocalization('zh-TW', '反小號')
        .setNameLocalization('ja', 'アンチサブ垢')
        .setDescription(
            'Setup the system to automatically kick small accounts (accounts less than 7 days old)'
        )
        .setDescriptionLocalization('zh-TW', '設定伺服器自動踢出小號(即未滿7日之帳號)系統')
        .setDescriptionLocalization('ja', '7日未満のサブアカウントを自動でキックするシステムを設定')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((sub) =>
            sub
                .setName('setup')
                .setNameLocalization('zh-TW', '設定')
                .setNameLocalization('ja', '設定')
                .setDescription('Setup the logging channel')
                .setDescriptionLocalization('zh-TW', '設定日誌頻道')
                .setDescriptionLocalization('ja', 'ログ用のチャンネルを設定')
                .addChannelOption((options) =>
                    options
                        .setName('channel')
                        .setNameLocalization('zh-TW', '頻道')
                        .setNameLocalization('ja', 'チャンネル')
                        .setDescription('Please select a channel for logging')
                        .setDescriptionLocalization('zh-TW', '選擇用於紀錄日誌的頻道')
                        .setDescriptionLocalization('ja', 'ログチャンネルを選択')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName('reset')
                .setNameLocalization('zh-TW', '重置')
                .setNameLocalization('ja', 'リセット')
                .setDescription('Reset the log channel')
                .setDescriptionLocalization('zh-TW', '重置日誌頻道')
                .setDescriptionLocalization('ja', 'ログチャンネルをリセット')
        ),
    usage: '/anti-alt (setup, channel)'
}
