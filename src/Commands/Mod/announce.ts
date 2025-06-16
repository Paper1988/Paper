import type { CommandType } from '@/typings/command'
import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    PermissionFlagsBits,
    SlashCommandBuilder
} from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('announcement')
        .setNameLocalization('zh-TW', '公告')
        .setNameLocalization('ja', 'アナウンス')
        .setDescription('Make an embed message announcement!')
        .setDescriptionLocalization('zh-TW', '製作一個嵌入式訊息公告!')
        .setDescriptionLocalization('ja', '埋め込みメッセージのアナウンスを作成！')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addStringOption((option) =>
            option
                .setName('title')
                .setNameLocalization('zh-TW', '標題')
                .setNameLocalization('ja', 'タイトル')
                .setDescription('Please enter your announcement title!')
                .setDescriptionLocalization('zh-TW', '請輸入公告標題!')
                .setDescriptionLocalization('ja', 'アナウンスのタイトルを入力してください！')
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('description')
                .setNameLocalization('zh-TW', '訊息')
                .setNameLocalization('ja', 'メッセージ')
                .setDescription('Please enter your announcement message! (Use \\n to break lines)')
                .setDescriptionLocalization('zh-TW', '請輸入您的公告訊息！（輸入 \\n 來換行）')
                .setDescriptionLocalization(
                    'ja',
                    'アナウンスするメッセージを入力してください！（\\n を使用して改行できます）'
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
                    '自訂訊息顏色（請使用十六進位色碼，例如：#00ff00）'
                )
                .setDescriptionLocalization(
                    'ja',
                    '埋め込みメッセージの色をカスタマイズ！（例: #00ff00）'
                )
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName('footer')
                .setNameLocalization('zh-TW', '頁腳')
                .setNameLocalization('ja', 'フッター')
                .setDescription('Please provide a footer for your embed message')
                .setDescriptionLocalization('zh-TW', '為公告添加頁腳')
                .setDescriptionLocalization('ja', '埋め込みメッセージにフッターを追加！')
                .setRequired(false)
        )
        .addBooleanOption((option) =>
            option
                .setName('timestamp')
                .setNameLocalization('zh-TW', '時間戳')
                .setNameLocalization('ja', 'タイムスタンプ')
                .setDescription('Whether to add a timestamp to your embed message?')
                .setDescriptionLocalization('zh-TW', '是否啟用時間戳?')
                .setDescriptionLocalization('ja', 'タイムスタンプを追加しますか？')
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName('ping')
                .setNameLocalization('zh-TW', '標註')
                .setNameLocalization('ja', 'ピン')
                .setDescription('The ping option for your embed message')
                .setDescriptionLocalization('zh-TW', '對您的公告消息的附加標註')
                .setDescriptionLocalization('ja', 'アナウンスメッセージのピンオプション')
                .setRequired(false)
                .addChoices(
                    { name: '@everyone', value: '@everyone' },
                    { name: '@here', value: '@here' }
                )
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const { options, user } = interaction
        const title = options.getString('title')
        const message = options.getString('description')
        const color = options.getString('color')
        const footer = options.getString('footer')
        const timestamp = options.getBoolean('timestamp')
        const ping = options.getString('ping')

        const splittedMsg = message!.replace(/\\n/g, '\n')

        const embed = new EmbedBuilder()
            .setAuthor({
                name: `${user.tag}`,
                iconURL: `${user.displayAvatarURL()}`
            })
            .setTitle(`${title}`)
            .setDescription(`${splittedMsg}`)

        if (color) {
            try {
                embed.setColor(color as `#${string}`)
            } catch {
                if (!/^#([0-9A-Fa-f]{6})$/.test(color)) {
                    return interaction.reply({
                        content: '請輸入有效的顏色代碼，例如 #00ff00',
                        ephemeral: true
                    })
                }
            }
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
} as CommandType
