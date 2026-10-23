import type { CommandType } from '@/typings/command.js'
import { sendModeratorLog } from '@/Systems/ModeratorLog.js'
import {
    ChannelType,
    ChatInputCommandInteraction,
    EmbedBuilder,
    MessageFlags,
    PermissionFlagsBits,
    SlashCommandBuilder
} from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('announcement')
        .setNameLocalization('zh-TW', '公告')
        .setNameLocalization('ja', 'アナウンス')
        .setDescription('Create an announcement embed.')
        .setDescriptionLocalization('zh-TW', '建立公告訊息')
        .setDescriptionLocalization('ja', '埋め込みアナウンスを作成します。')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addStringOption((option) =>
            option
                .setName('title')
                .setNameLocalization('zh-TW', '標題')
                .setNameLocalization('ja', 'タイトル')
                .setDescription('The announcement title.')
                .setDescriptionLocalization('zh-TW', '公告標題')
                .setDescriptionLocalization('ja', 'アナウンスのタイトル')
                .setMaxLength(256)
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('description')
                .setNameLocalization('zh-TW', '訊息')
                .setNameLocalization('ja', 'メッセージ')
                .setDescription('Announcement text. Use \\n to start a new line.')
                .setDescriptionLocalization('zh-TW', '公告內容，輸入 \\n 可換行')
                .setDescriptionLocalization('ja', '本文。\\n で改行できます。')
                .setMaxLength(4000)
                .setRequired(true)
        )
        .addChannelOption((option) =>
            option
                .setName('channel')
                .setNameLocalization('zh-TW', '頻道')
                .setNameLocalization('ja', 'チャンネル')
                .setDescription('Where to post the announcement. Defaults to this channel.')
                .setDescriptionLocalization('zh-TW', '公告發送頻道，預設為目前頻道')
                .setDescriptionLocalization('ja', '投稿先。省略すると現在のチャンネルになります。')
                .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName('color')
                .setNameLocalization('zh-TW', '顏色')
                .setNameLocalization('ja', 'カラー')
                .setDescription('Hex color, for example #00ff00.')
                .setDescriptionLocalization('zh-TW', '十六進位色碼，例如 #00ff00')
                .setDescriptionLocalization('ja', '16進カラーコード。例: #00ff00')
                .setMaxLength(7)
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName('footer')
                .setNameLocalization('zh-TW', '頁腳')
                .setNameLocalization('ja', 'フッター')
                .setDescription('Optional footer text.')
                .setDescriptionLocalization('zh-TW', '選填的頁腳文字')
                .setDescriptionLocalization('ja', '任意のフッターテキスト')
                .setMaxLength(2048)
                .setRequired(false)
        )
        .addBooleanOption((option) =>
            option
                .setName('timestamp')
                .setNameLocalization('zh-TW', '時間戳')
                .setNameLocalization('ja', 'タイムスタンプ')
                .setDescription('Whether to show the current timestamp.')
                .setDescriptionLocalization('zh-TW', '是否顯示時間戳')
                .setDescriptionLocalization('ja', 'タイムスタンプを表示するか')
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName('ping')
                .setNameLocalization('zh-TW', '標註')
                .setNameLocalization('ja', 'メンション')
                .setDescription('Optionally mention everyone or online members.')
                .setDescriptionLocalization('zh-TW', '選擇是否標註所有人或在線成員')
                .setDescriptionLocalization('ja', '全員またはオンラインのメンバーにメンションします。')
                .setRequired(false)
                .addChoices(
                    { name: '@everyone', value: '@everyone' },
                    { name: '@here', value: '@here' }
                )
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const { options, user, guild } = interaction
        if (!guild) {
            return interaction.reply({
                content: '此指令只能在伺服器中使用。',
                flags: MessageFlags.Ephemeral
            })
        }

        const title = options.getString('title', true).trim()
        const message = options.getString('description', true).replace(/\\n/g, '\n')
        const color = options.getString('color')
        const footer = options.getString('footer')
        const timestamp = options.getBoolean('timestamp') ?? false
        const ping = options.getString('ping')
        const targetChannel = options.getChannel('channel') ?? interaction.channel

        if (!title) {
            return interaction.reply({
                content: '公告標題不能是空白。',
                flags: MessageFlags.Ephemeral
            })
        }

        if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
            return interaction.reply({
                content: '顏色格式不正確，請使用六位十六進位色碼，例如 #00ff00。',
                flags: MessageFlags.Ephemeral
            })
        }

        if (!targetChannel?.isTextBased() || targetChannel.isDMBased() || !('send' in targetChannel)) {
            return interaction.reply({
                content: '請選擇可發送訊息的伺服器文字頻道。',
                flags: MessageFlags.Ephemeral
            })
        }

        const botMember = guild.members.me
        if (!botMember) {
            return interaction.reply({
                content: '目前無法確認機器人的伺服器權限，請稍後再試。',
                flags: MessageFlags.Ephemeral
            })
        }

        const permissions = targetChannel.permissionsFor(botMember)
        if (!permissions?.has([
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.EmbedLinks
        ])) {
            return interaction.reply({
                content: '機器人在指定頻道需要「查看頻道」、「發送訊息」及「嵌入連結」權限。',
                flags: MessageFlags.Ephemeral
            })
        }

        if (ping && !permissions.has(PermissionFlagsBits.MentionEveryone)) {
            return interaction.reply({
                content: '機器人在指定頻道沒有「提及 @everyone、@here 和所有角色」權限。',
                flags: MessageFlags.Ephemeral
            })
        }

        const embed = new EmbedBuilder()
            .setColor(color ? Number.parseInt(color.slice(1), 16) : 0xA3A3A3)
            .setAuthor({
                name: user.tag,
                iconURL: user.displayAvatarURL()
            })
            .setTitle(title)
            .setDescription(message)

        if (footer) embed.setFooter({ text: footer })
        if (timestamp) embed.setTimestamp()

        await interaction.deferReply({ flags: MessageFlags.Ephemeral })

        try {
            await targetChannel.send({
                content: ping ?? undefined,
                embeds: [embed],
                allowedMentions: { parse: ping ? ['everyone'] : [] }
            })
        } catch (error) {
            console.error('[Announcement Command] Failed to send announcement:', error)
            return interaction.editReply({
                content: '公告發送失敗，請確認機器人的頻道權限後再試。'
            })
        }

        await sendModeratorLog(interaction, {
            action: '發布公告',
            details: [
                `標題：${title}`,
                `公告頻道：<#${targetChannel.id}>`,
                `標註：${ping ?? '無'}`
            ]
        })

        return interaction.editReply({
            content: `公告已成功發布至 <#${targetChannel.id}>。`
        })
    }
} as CommandType
