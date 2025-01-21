const {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
    PermissionFlagsBits
} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('announcement')
        .setNameLocalization('zh-TW', '公告')
        .setNameLocalization('ja', 'アナウンス')
        .setDescription('Make an embed message announcement!')
        .setDescriptionLocalization('zh-TW', '製作一個嵌入式訊息公告!')
        .setDescriptionLocalization('ja', '埋入式メッセージのアナウンスを作成!')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addStringOption((option) =>
            option
                .setName('title')
                .setNameLocalization('zh-TW', '標題')
                .setNameLocalization('ja', 'タイトル')
                .setDescription('Please enter your announcement title!')
                .setDescriptionLocalization('zh-TW', '請輸入您的公告標題!')
                .setDescriptionLocalization('ja', 'あなたのアナウンスタイトルを入力してください!')
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('description')
                .setNameLocalization('zh-TW', '訊息')
                .setNameLocalization('ja', 'メッセージ')
                .setDescription('Please enter your announcement message! (Use \\n to break lines)')
                .setDescriptionLocalization('zh-TW', '請輸入您的公告訊息(輸入\\n來換行)')
                .setDescriptionLocalization(
                    'ja',
                    'あなたがアナウンスするメッセージを入力してください(\\nを使用して改行)'
                )
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('color')
                .setNameLocalization('zh-TW', '顏色')
                .setNameLocalization('ja', 'カラー')
                .setDescription(
                    'Customize your embed message color.(Please use hex color code, example: #00ff00)'
                )
                .setDescriptionLocalization(
                    'zh-TW',
                    '自定義您的嵌入顏色 (請使用六進位制色碼，例如: #00ff00)'
                )
                .setDescriptionLocalization('ja', 'あなたの埋入カラーをカスタマイズ! (例: #00ff00)')
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName('footer')
                .setNameLocalization('zh-TW', '頁腳')
                .setNameLocalization('ja', 'フッター')
                .setDescription('Please provide a footer for your embed message')
                .setDescriptionLocalization('zh-TW', '為您的公告添加頁腳')
                .setDescriptionLocalization('ja', 'あなたのアナウンスにフッターを追加!')
                .setRequired(false)
        )
        .addBooleanOption((option) =>
            option
                .setName('timestamp')
                .setNameLocalization('zh-TW', '時間戳')
                .setNameLocalization('ja', 'タイムスタンプ')
                .setDescription('Whether to add a timestamp to your embed message?')
                .setDescriptionLocalization('zh-TW', '是否啟用時間戳?')
                .setDescriptionLocalization('ja', 'タイムスタンプを有効にするか?')
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName('ping')
                .setNameLocalization('zh-TW', '標註')
                .setNameLocalization('ja', 'ピン')
                .setDescription('The ping option for your embed message')
                .setDescriptionLocalization('zh-TW', '對您的公告消息的附加標註')
                .setDescriptionLocalization('ja', 'あなたのアナウンスメッセージの追加標註')
                .setRequired(false)
                .addChoices(
                    { name: '@everyone', value: '@everyone' },
                    { name: '@here', value: '@here' }
                )
        ),
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const { options, user } = interaction
        const title = options.getString('title')
        const message = options.getString('description')
        const color = options.getString('color')
        const footer = options.getString('footer')
        const timestamp = options.getBoolean('timestamp')
        const ping = options.getString('ping')

        const splittedMsg = message.replace(/\\n/g, '\n')

        const embed = new EmbedBuilder()
            .setAuthor({
                name: `${user.tag}`,
                iconURL: `${user.displayAvatarURL({ dynamic: true })}`
            })
            .setTitle(`${title}`)
            .setDescription(`${splittedMsg}`)

        if (color)
            try {
                embed.setColor(color[0].toUpperCase())
            } catch {
                return await interaction.reply('無效的色碼格式! 請使用六進位制色碼!')
            }
        if (footer) embed.setFooter({ text: footer })
        if (timestamp) embed.setTimestamp()

        if (!ping) {
            await interaction.reply({
                embeds: [embed]
            })
        } else {
            await interaction.reply({
                content: `${ping === '@everyone' ? '@everyone' : '@here'}`,
                embeds: [embed],
                allowedMentions: {
                    parse: ['everyone']
                }
            })
        }
    }
}
