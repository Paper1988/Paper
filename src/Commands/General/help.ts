import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    ContainerBuilder,
    MessageFlags,
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    TextDisplayBuilder,
} from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('help')
        .setNameLocalization('zh-TW', '幫助')
        .setNameLocalization('ja', 'ヘルプ')
        .setDescription('View command list')
        .setDescriptionLocalization('zh-TW', '查看指令列表')
        .setDescriptionLocalization('ja', 'コマンドリストを表示')
        .addStringOption((option) =>
            option
                .setName('command')
                .setNameLocalization('zh-TW', '指令')
                .setNameLocalization('ja', 'コマンド')
                .setDescription('View specific command information')
                .setDescriptionLocalization('zh-TW', '查看特定指令的資訊')
                .setDescriptionLocalization('ja', '特定のコマンド情報を表示')
                .setRequired(false),
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const helpMenu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('helpMenu')
                .setPlaceholder('選擇一個分類')
                .addOptions(
                    { label: '🔧 功能', description: '顯示所有功能指令', value: 'General' },
                    { label: '🔒 管理', description: '管理員與版主可用的指令', value: 'Moderation' },
                    { label: '🎶 音樂', description: '顯示所有音樂指令', value: 'Music' },
                    { label: '🎁 抽獎', description: '顯示所有抽獎指令', value: 'Giveaway' },
                    { label: '🎭 娛樂', description: '顯示所有娛樂指令', value: 'Fun' },
                    { label: '📅 會議', description: '會議管理與效率工具', value: 'Meeting' },
                ),
        )

        const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=1644971945463&scope=bot%20applications.commands`
        const inviteAndSupport = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setLabel('邀請 Paper').setStyle(ButtonStyle.Link).setURL(inviteUrl),
            new ButtonBuilder().setLabel('支援伺服器').setStyle(ButtonStyle.Link).setURL('https://discord.gg/6qCTEer4pT'),
        )
        const support = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setLabel('請我喝杯咖啡')
                .setEmoji('<:kofi:1308733627496009738>')
                .setStyle(ButtonStyle.Link)
                .setURL('https://ko-fi.com/paper1988'),
        )

        const container = new ContainerBuilder()
            .setAccentColor(0xA3A3A3)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    '# Paper / 指令導覽\n' +
                    'Music · Utilities · Community\n\n' +
                    'Paper 將音樂、伺服器管理與社群互動整合在同一個地方。選擇下方分類，查看各項指令與使用方式。',
                ),
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    '## 快速開始\n' +
                    '**01**  從分類選單選擇功能\n' +
                    '**02**  使用 Discord 斜線指令 `/`\n' +
                    '**03**  需要協助時，前往支援伺服器',
                ),
            )
            .addActionRowComponents(helpMenu)
            .addActionRowComponents(inviteAndSupport)
            .addActionRowComponents(support)

        await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
        })
    },
}
