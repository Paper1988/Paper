import BugReport from '@/Structures/Schemas/Report.js'
import {
    ActionRowBuilder,
    ApplicationIntegrationType,
    Attachment,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    Client,
    type ColorResolvable,
    EmbedBuilder,
    Guild,
    InteractionContextType,
    MessageFlags,
    SlashCommandBuilder,
    TextChannel
} from 'discord.js'

// ─── Constants ────────────────────────────────────────────────────────────────

const REPORT_CHANNEL_ID = '975253353913254029'

type FeedbackType = 'bug' | 'suggestion' | 'other'

interface FeedbackConfig {
    title: string
    color: ColorResolvable
    fieldName: string
}

const FEEDBACK_CONFIG: Record<FeedbackType, FeedbackConfig> = {
    bug: {
        title: '<:bug:1265560184722559020> | Bug',
        color: 'Red',
        fieldName: '提供的描述:'
    },
    suggestion: {
        title: '<:bulb:1265560195178958941> | 建議',
        color: 'Yellow',
        fieldName: '提供的建議:'
    },
    other: {
        title: '<:globe:1265560486208864318> | 其他',
        color: 'Purple',
        fieldName: '提供的描述:'
    }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildEmbed(
    interaction: ChatInputCommandInteraction,
    guild: Guild | null,
    config: FeedbackConfig,
    description: string,
    picture: Attachment | null
): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle(config.title)
        .setColor(config.color)
        .setDescription(
            `提交者: ${interaction.user}(${interaction.user.id})` +
                (guild ? `\n伺服器: ${guild.name}(${guild.id})` : '')
        )
        .addFields({
            name: config.fieldName,
            value: `\`\`\`${description}\`\`\``,
            inline: true
        })
        .setAuthor({
            name: interaction.user.username,
            iconURL: interaction.user.avatarURL() ?? undefined
        })
        .setFooter(
            guild
                ? { text: guild.name, iconURL: guild.iconURL() ?? undefined }
                : { text: interaction.user.username }
        )
        .setImage(picture?.url ?? null)
        .setTimestamp()
}

function buildButton(
    customId: string,
    label: string,
    emoji: string,
    style: ButtonStyle
): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId(customId).setLabel(label).setEmoji(emoji).setStyle(style)
    )
}

// ─── Command ──────────────────────────────────────────────────────────────────

export default {
    data: new SlashCommandBuilder()
        .setName('feedback')
        .setNameLocalization('zh-TW', '回饋')
        .setNameLocalization('ja', 'フィードバック')
        .setDescription('Report bugs and suggestions to the developers')
        .setDescriptionLocalization('zh-TW', '回報Bug、提出建議')
        .setDescriptionLocalization('ja', 'バグや提案を開発者に報告する')
        .setIntegrationTypes([
            ApplicationIntegrationType.GuildInstall,
            ApplicationIntegrationType.UserInstall
        ])
        .setContexts([
            InteractionContextType.Guild,
            InteractionContextType.BotDM,
            InteractionContextType.PrivateChannel
        ])
        .addStringOption((option) =>
            option
                .setName('type')
                .setNameLocalization('zh-TW', '類別')
                .setNameLocalization('ja', 'カテゴリ')
                .setDescription('Please choose a type')
                .setDescriptionLocalization('zh-TW', '請選擇類別')
                .setDescriptionLocalization('ja', 'カテゴリを選択してください')
                .setRequired(true)
                .addChoices(
                    { name: '🐞 | Bug', value: 'bug' },
                    { name: '💡 | 建議', value: 'suggestion' },
                    { name: '🌀 | 其他', value: 'other' }
                )
        )
        .addStringOption((option) =>
            option
                .setName('description')
                .setNameLocalization('zh-TW', '描述內容')
                .setNameLocalization('ja', '詳細な内容')
                .setDescription('Please provide the detail of the bugs/suggestions')
                .setDescriptionLocalization('zh-TW', '請提供 Bug、建議的詳細內容')
                .setDescriptionLocalization('ja', 'バグや提案の詳細な内容を入力してください')
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('command')
                .setNameLocalization('zh-TW', '指令')
                .setNameLocalization('ja', 'コマンド')
                .setDescription('Which command caused the error?')
                .setDescriptionLocalization('zh-TW', '這是哪個指令造成的bug?')
                .setDescriptionLocalization('ja', 'このバグの原因となるコマンドはどれですか?')
                .setRequired(false)
        )
        .addAttachmentOption((option) =>
            option
                .setName('picture')
                .setNameLocalization('zh-TW', '圖片')
                .setNameLocalization('ja', '写真')
                .setDescription('Please provide a picture of the bug you encountered')
                .setDescriptionLocalization('zh-TW', '請提供圖片')
                .setDescriptionLocalization('ja', '遭遇したバグの写真を提供してください')
                .setRequired(false)
        ),

    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const type = interaction.options.getString('type') as FeedbackType
        const description = interaction.options.getString('description', true)
        const command = interaction.options.getString('command')
        const picture = interaction.options.getAttachment('picture')
        const guild = interaction.guild

        const config = FEEDBACK_CONFIG[type]
        if (!config) return

        const sch = client.channels.cache.get(REPORT_CHANNEL_ID) as TextChannel

        // Build embed
        const embed = buildEmbed(interaction, guild, config, description, picture)

        // Bug 類需要額外附上造成錯誤的指令
        if (type === 'bug') {
            embed.addFields({
                name: '造成bug的指令:',
                value: `\`\`\`${command ?? '無選擇'}\`\`\``,
                inline: false
            })
        }

        // Buttons
        const sendButton = buildButton(
            'report-send',
            '提交回報',
            '<:correct:1265560254708711467>',
            ButtonStyle.Success
        )
        const cancelButton = buildButton(
            'report-cancel',
            '取消',
            '<:xmark:1265562550947545089>',
            ButtonStyle.Danger
        )

        // Bug 限定：後台的「已解決」按鈕
        const fixedButton =
            type === 'bug'
                ? buildButton(
                      `feedback-fixed:${interaction.user.id}`,
                      '解決',
                      '<:fix:1265269709834813462>',
                      ButtonStyle.Primary
                  )
                : null

        // Reply with preview
        const message = await interaction.reply({
            content: '## 預覽:',
            embeds: [embed],
            components: [cancelButton, sendButton],
            flags: MessageFlags.Ephemeral
        })

        // Collector
        const collector = message.createMessageComponentCollector()

        collector.on('collect', async (i) => {
            if (i.customId === 'report-send') {
                await sch.send({
                    embeds: [embed],
                    ...(fixedButton && { components: [fixedButton] })
                })

                if (type === 'bug') {
                    await new BugReport({
                        userId: interaction.user.id,
                        createdAt: interaction.createdAt
                    }).save()
                }

                await i.update({
                    content: '',
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('<:correct:1265560254708711467> | 你的回報已成功提交!')
                            .setColor('Green')
                    ],
                    components: []
                })
            } else if (i.customId === 'report-cancel') {
                await i.update({
                    content: '',
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('<:outage:1265561329528471613> | 你的回報已成功取消!')
                            .setColor('Red')
                    ],
                    components: []
                })
            }
        })
    }
}
