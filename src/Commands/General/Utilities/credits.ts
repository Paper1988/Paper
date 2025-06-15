import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    MessageFlags,
    SlashCommandBuilder
} from 'discord.js'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('credits')
        .setNameLocalization('zh-TW', '版權資訊')
        .setNameLocalization('ja', 'クレジット')
        .setDescription('檢視版權資訊')
        .setDescriptionLocalization('zh-TW', '檢視版權資訊')
        .setDescriptionLocalization('ja', '著作権情報を表示'),
    async execute(interaction: ChatInputCommandInteraction) {
        const embed = new EmbedBuilder().setTitle('版權提供者').addFields(
            {
                name: 'Icons圖標',
                value: 'https://discord.gg/9AtkECMX2P'
            },
            {
                name: '音樂歌詞來源',
                value: 'https://genius.com'
            }
        )
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral })
    }
}
