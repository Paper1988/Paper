const { PermissionFlagsBits, SlashCommandBuilder, ChannelType } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anti-alt')
        .setDescription('設定伺服器自動踢出小號(即未滿7日之帳號)系統')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((sub) =>
            sub
                .setName('setup')
                .setDescription('設定日誌頻道')
                .addChannelOption((options) =>
                    options
                        .setName('channel')
                        .setDescription('選擇用於紀錄日誌的頻道')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
        )
        .addSubcommand((sub) => sub.setName('reset').setDescription('關閉自動踢出小號系統')),
    usage: '/anti-alt (setup, channel)'
}
