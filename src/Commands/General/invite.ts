import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    Client,
    ContainerBuilder,
    MessageFlags,
    SlashCommandBuilder,
    TextDisplayBuilder,
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
        const actions = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setURL(
                    `https://discord.com/api/oauth2/authorize?client_id=${client.user!.id}&permissions=1644971945463&scope=bot%20applications.commands`,
                )
                .setLabel('邀請 Paper')
                .setStyle(ButtonStyle.Link),
            new ButtonBuilder()
                .setURL('https://discord.gg/6qCTEer4pT')
                .setLabel('支援伺服器')
                .setStyle(ButtonStyle.Link),
        )

        const container = new ContainerBuilder()
            .setAccentColor(0xA3A3A3)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    '# 邀請 Paper\n' +
                        'Paper · Music, utilities, and community\n\n' +
                        '將 Paper 加入你的伺服器，使用音樂播放、實用工具與社群互動功能。\n\n' +
                        `由 ${interaction.user} 發起 · ${client.user?.username ?? 'Paper'}`,
                ),
            )
            .addActionRowComponents(actions)

        await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
        })
    },
}
