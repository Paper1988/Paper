import {
    ChatInputCommandInteraction,
    ContainerBuilder,
    MessageFlags,
    SlashCommandBuilder,
    TextDisplayBuilder,
} from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('credits')
        .setNameLocalization('zh-TW', '版權資訊')
        .setNameLocalization('ja', 'クレジット')
        .setDescription('檢視版權資訊')
        .setDescriptionLocalization('zh-TW', '檢視版權資訊')
        .setDescriptionLocalization('ja', '著作権情報を表示'),
    async execute(interaction: ChatInputCommandInteraction) {
        const container = new ContainerBuilder()
            .setAccentColor(0xA3A3A3)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    '# Credits\n' +
                        'Paper · 版權與來源\n\n' +
                        '**圖示資源**\n' +
                        'https://discord.gg/9AtkECMX2P\n\n' +
                        '**音樂歌詞來源**\n' +
                        'https://genius.com',
                ),
            )

        await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        })
    },
}
