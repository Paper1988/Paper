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

const API_URL = 'https://memes.tw/wtf/api'
const ACCENT_COLOR = 0xA3A3A3

interface Meme {
    id?: number
    url?: string
    src?: string
    title?: string
    author?: { name?: string }
    total_like_count?: number
    contest?: { name?: string }
    hashtag?: string
}

function createMessage(content: string) {
    return new ContainerBuilder()
        .setAccentColor(ACCENT_COLOR)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(content))
}

function isHttpUrl(value: unknown): value is string {
    if (typeof value !== 'string' || !URL.canParse(value)) return false
    return ['http:', 'https:'].includes(new URL(value).protocol)
}

export default {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setNameLocalization('zh-TW', '梗圖')
        .setNameLocalization('ja', 'ミーム')
        .setDescription('Get a random Taiwanese meme')
        .setDescriptionLocalization('zh-TW', '取得一張台灣梗圖')
        .setDescriptionLocalization('ja', '台湾のミームをランダムに取得')
        .addStringOption((option) =>
            option
                .setName('category')
                .setNameLocalization('zh-TW', '分類')
                .setNameLocalization('ja', 'カテゴリー')
                .setDescription('Choose a meme category')
                .setDescriptionLocalization('zh-TW', '選擇梗圖分類')
                .setDescriptionLocalization('ja', 'ミームのカテゴリーを選択')
                .addChoices(
                    { name: '熱門梗圖', name_localizations: { 'zh-TW': '熱門梗圖', ja: '人気ミーム' }, value: 'hot' },
                    { name: '校園生活', name_localizations: { 'zh-TW': '校園生活', ja: '学校生活' }, value: 'campus' },
                ),
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply({
            components: [createMessage('# 梗圖倉庫\n正在翻找今日的快樂來源…')],
            flags: MessageFlags.IsComponentsV2,
        })

        try {
            const category = interaction.options.getString('category') ?? 'hot'
            const url = new URL(API_URL)
            if (category === 'campus') url.searchParams.set('contest', '11')

            const response = await fetch(url, {
                headers: { Accept: 'application/json' },
                signal: AbortSignal.timeout(8_000),
            })

            if (!response.ok) throw new Error(`Memes.tw API returned HTTP ${response.status}`)

            const payload = (await response.json()) as Meme[] | { data?: Meme[] }
            const memes = Array.isArray(payload) ? payload : payload.data ?? []
            const candidates = memes.filter((item) => isHttpUrl(item.src))
            if (candidates.length === 0) {
                await interaction.editReply({
                    components: [createMessage('# 暫時沒有梗圖\n這個分類目前沒有可用的圖片，請稍後再試。')],
                })
                return
            }

            const meme = candidates[Math.floor(Math.random() * candidates.length)]
            const title = (meme.title || '今日份梗圖').slice(0, 180)
            const details = [
                meme.author?.name ? `**作者** · ${meme.author.name}` : null,
                meme.contest?.name ? `**分類** · ${meme.contest.name}` : null,
                typeof meme.total_like_count === 'number' ? `**讚數** · ${meme.total_like_count.toLocaleString('zh-TW')}` : null,
                meme.hashtag ? `**標籤** · ${meme.hashtag.slice(0, 200)}` : null,
            ].filter(Boolean).join('\n')

            const container = createMessage(`# ${title}\n${details || '來自梗圖倉庫的隨機投稿。'}`)
            container.addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems(
                    new MediaGalleryItemBuilder().setURL(meme.src!),
                ),
            )

            const linkRow = isHttpUrl(meme.url)
                ? new ActionRowBuilder<ButtonBuilder>().addComponents(
                      new ButtonBuilder()
                          .setStyle(ButtonStyle.Link)
                          .setURL(meme.url)
                          .setLabel('查看原始梗圖'),
                  )
                : null

            await interaction.editReply({
                components: linkRow ? [container, linkRow] : [container],
            })
        } catch (error) {
            console.error('[meme] Failed to fetch meme:', error)
            await interaction.editReply({
                components: [createMessage('# 梗圖暫時失聯\n梗圖倉庫目前無法回應，請稍後再試。')],
            })
        }
    },
}
