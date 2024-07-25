const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gif')
        .setDescription('隨機產生一張gif動圖')
        .setDMPermission(false)
        .addSubcommand((sub) =>
            sub
                .setName('bite')
                .setDescription('咬某人一口!')
                .addUserOption((option) =>
                    option.setName('member').setDescription('請選擇一名用戶').setRequired(true)
                )
        )
        .addSubcommand((sub) => sub.setName('dance').setDescription('跳舞!'))
        .addSubcommand((sub) =>
            sub
                .setName('hug')
                .setDescription('擁抱某人!')
                .addUserOption((option) =>
                    option.setName('member').setDescription('請選擇一名用戶').setRequired(true)
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName('kill')
                .setDescription('殺掉某人!')
                .addUserOption((option) =>
                    option.setName('member').setDescription('請選擇一名用戶').setRequired(true)
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName('kiss')
                .setDescription('親吻某人!')
                .addUserOption((option) =>
                    option.setName('member').setDescription('請選擇一名用戶').setRequired(true)
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName('pat')
                .setDescription('摸摸某人!')
                .addUserOption((option) =>
                    option.setName('member').setDescription('請選擇一名用戶').setRequired(true)
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName('punch')
                .setDescription('揍爆某人!')
                .addUserOption((option) =>
                    option.setName('member').setDescription('請選擇一名用戶').setRequired(true)
                )
        )
}
