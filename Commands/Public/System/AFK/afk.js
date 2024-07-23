const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('一個afk系統')
        .setDMPermission(false)
        .addSubcommand((sub) =>
            sub
                .setName('set')
                .setDescription('進入afk狀態')
                .addStringOption((options) =>
                    options.setName('status').setDescription('設定你的狀態').setRequired(true)
                )
        )
        .addSubcommand((sub) => sub.setName('return').setDescription('退出afk狀態')),
    usage: '/afk (set, return)'
}
