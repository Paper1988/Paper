import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    ContainerBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    MessageFlags,
    SlashCommandBuilder,
    TextDisplayBuilder,
} from 'discord.js'
import mal from 'mal-scraper'

const ACCENT_COLOR = 0xA3A3A3
const MAX_SYNOPSIS_LENGTH = 3_500

export default {
    data: new SlashCommandBuilder()
        .setName('anime')
        .setNameLocalization('zh-TW', '動漫')
        .setNameLocalization('ja', 'アニメ')
        .setDescription('Search for anime information')
        .setDescriptionLocalization('zh-TW', '搜尋動漫資訊')
        .setDescriptionLocalization('ja', 'アニメ情報を検索')
        .addStringOption((option) =>
            option
                .setName('query')
                .setNameLocalization('zh-TW', '搜尋')
                .setNameLocalization('ja', '検索')
                .setDescription('Please enter the anime name')
                .setDescriptionLocalization('zh-TW', '請輸入動漫名稱')
                .setDescriptionLocalization('ja', 'アニメ名を入力してください')
                .setRequired(true),
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const search = interaction.options.getString('query', true).trim()

        await interaction.deferReply({ flags: MessageFlags.IsComponentsV2 })

        try {
            const data = await mal.getInfoFromName(search)
            const synopsis = data.synopsis?.trim() || '目前沒有可用的劇情簡介。'
            const description =
                synopsis.length > MAX_SYNOPSIS_LENGTH
                    ? `${synopsis.slice(0, MAX_SYNOPSIS_LENGTH - 1)}…`
                    : synopsis

            const details = [
                `**英文標題** · ${data.englishTitle || '無'}`,
                `**類型** · ${data.type || '無'}`,
                `**集數** · ${data.episodes || '無'}`,
                `**分數** · ${data.score || '無'}`,
                `**分級** · ${data.rating || '無'}`,
                `**上映日期** · ${data.aired || '無'}`,
            ]

            const container = new ContainerBuilder()
                .setAccentColor(ACCENT_COLOR)
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `# ${data.title || search}\n` +
                            `搜尋結果 · ${search}\n\n` +
                            `**劇情簡介**\n${description}\n\n` +
                            details.join('\n'),
                    ),
                )

            if (data.picture) {
                container.addMediaGalleryComponents(
                    new MediaGalleryBuilder().addItems(
                        new MediaGalleryItemBuilder().setURL(data.picture),
                    ),
                )
            }

            const linkRow = data.url
                ? new ActionRowBuilder<ButtonBuilder>().addComponents(
                      new ButtonBuilder()
                          .setStyle(ButtonStyle.Link)
                          .setURL(data.url)
                          .setLabel('查看更多'),
                  )
                : null

            await interaction.editReply({
                components: linkRow ? [container, linkRow] : [container],
            })
        } catch (error) {
            console.error('[anime] Failed to fetch anime information:', error)
            await interaction.editReply({
                components: [
                    new ContainerBuilder()
                        .setAccentColor(ACCENT_COLOR)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(
                                '# 找不到動漫資訊\n' +
                                    `無法取得「${search}」的搜尋結果，請確認名稱或稍後再試。`,
                            ),
                        ),
                ],
            })
        }
    },
}
