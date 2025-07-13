import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    Client,
    EmbedBuilder,
    SlashCommandBuilder
} from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setNameLocalization('zh-TW', '邀請我')
        .setNameLocalization('ja', '招待')
        .setDescription('Invite me!')
        .setDescriptionLocalization('zh-TW', '邀請我加入你的伺服器!')
        .setDescriptionLocalization('ja', '私をあなたのサーバーに招待してください！'),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const Invite = new EmbedBuilder()
            .setDescription('使用下面的按鈕來**讓我加入你的伺服器**或**加入我們的支援伺服器**！')
            .setColor('Blue')
            .setThumbnail(client.user!.displayAvatarURL())
            .setAuthor({
                name: interaction.user.displayName,
                iconURL: interaction.user.displayAvatarURL()
            })

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents([
            new ButtonBuilder()
                .setURL(
                    'https://discord.com/api/oauth2/authorize?client_id=***REMOVED***&permissions=1644971945463&scope=bot%20applications.commands'
                )
                .setLabel('點我邀請')
                .setStyle(ButtonStyle.Link),
            new ButtonBuilder()
                .setURL('https://discord.gg/6qCTEer4pT')
                .setLabel('支援伺服器')
                .setStyle(ButtonStyle.Link)
        ])
        await interaction.reply({ embeds: [Invite], components: [row] })
    }
}
