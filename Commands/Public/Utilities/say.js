const { SlashCommandBuilder, ChatInputCommandInteraction } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setNameLocalization('zh-TW', '幫我說')
        .setNameLocalization('ja', '代わりに言って')
        .setDescription('Let the bot say something for you')
        .setDescriptionLocalization('zh-TW', '讓機器人代替你說話')
        .setDescriptionLocalization('ja', '代わりに話してくれる')
        .addStringOption((option) =>
            option
                .setName('text')
                .setNameLocalization('zh-TW', '文字')
                .setNameLocalization('ja', 'テキスト')
                .setDescription('Please provide some text')
                .setDescriptionLocalization('zh-TW', '請輸入文字')
                .setDescriptionLocalization('ja', '文字を入力してください')
                .setRequired(true)
        ),
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        await interaction.deferReply()
        await interaction.editReply(interaction.options.getString('text'))
    }
}
