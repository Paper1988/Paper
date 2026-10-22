import {
    ChatInputCommandInteraction,
    ContainerBuilder,
    MessageFlags,
    SlashCommandBuilder,
    TextDisplayBuilder,
} from 'discord.js'

const API_URL = 'https://v1.hitokoto.cn/'
const ACCENT_COLOR = 0xA3A3A3

const CATEGORIES = [
    { name: '動漫', value: 'a', label: '動漫' },
    { name: '漫畫', value: 'b', label: '漫畫' },
    { name: '遊戲', value: 'c', label: '遊戲' },
    { name: '文學', value: 'd', label: '文學' },
    { name: '原創', value: 'e', label: '原創' },
    { name: '網路', value: 'f', label: '網路' },
    { name: '搞笑', value: 'j', label: '搞笑' },
    { name: '隨機', value: 'all', label: '隨機' },
] as const

interface HitokotoResponse {
    id?: number
    uuid?: string
    hitokoto?: string
    type?: string
    from?: string
    from_who?: string | null
}

function createMessage(content: string) {
    return new ContainerBuilder()
        .setAccentColor(ACCENT_COLOR)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(content))
}

export default {
    data: new SlashCommandBuilder()
        .setName('quote')
        .setNameLocalization('zh-TW', '語錄')
        .setNameLocalization('ja', '名言')
        .setDescription('Get a random quote')
        .setDescriptionLocalization('zh-TW', '取得一句隨機語錄')
        .setDescriptionLocalization('ja', 'ランダムな名言を取得')
        .addStringOption((option) =>
            option
                .setName('category')
                .setNameLocalization('zh-TW', '分類')
                .setNameLocalization('ja', 'カテゴリー')
                .setDescription('Choose a quote category')
                .setDescriptionLocalization('zh-TW', '選擇語錄分類')
                .setDescriptionLocalization('ja', '名言のカテゴリーを選択')
                .addChoices(
                    { name: '隨機', name_localizations: { 'zh-TW': '隨機', ja: 'ランダム' }, value: 'all' },
                    { name: '動漫', name_localizations: { 'zh-TW': '動漫', ja: 'アニメ' }, value: 'a' },
                    { name: '漫畫', name_localizations: { 'zh-TW': '漫畫', ja: '漫画' }, value: 'b' },
                    { name: '遊戲', name_localizations: { 'zh-TW': '遊戲', ja: 'ゲーム' }, value: 'c' },
                    { name: '文學', name_localizations: { 'zh-TW': '文學', ja: '文学' }, value: 'd' },
                    { name: '原創', name_localizations: { 'zh-TW': '原創', ja: 'オリジナル' }, value: 'e' },
                    { name: '網路', name_localizations: { 'zh-TW': '網路', ja: 'インターネット' }, value: 'f' },
                    { name: '搞笑', name_localizations: { 'zh-TW': '搞笑', ja: '面白い' }, value: 'j' },
                ),
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply({
            components: [createMessage('# 今日語錄\n正在尋找一句值得收藏的話…')],
            flags: MessageFlags.IsComponentsV2,
        })

        try {
            const category = interaction.options.getString('category') ?? 'all'
            const url = new URL(API_URL)
            if (category !== 'all') url.searchParams.set('c', category)

            const response = await fetch(url, {
                headers: { Accept: 'application/json' },
                signal: AbortSignal.timeout(8_000),
            })

            if (!response.ok) throw new Error(`Hitokoto API returned HTTP ${response.status}`)

            const quote = (await response.json()) as HitokotoResponse
            if (typeof quote.hitokoto !== 'string' || !quote.hitokoto.trim()) {
                throw new Error('Hitokoto API returned an empty quote')
            }

            const attribution = [
                quote.from_who?.trim(),
                quote.from?.trim(),
            ].filter(Boolean).join(' · ')
            const categoryLabel = CATEGORIES.find((item) => item.value === category)?.label ?? '隨機'
            const content = [
                '# 一言',
                `> ${quote.hitokoto.slice(0, 1_500)}`,
                '',
                attribution ? `**出處** · ${attribution.slice(0, 250)}` : '**出處** · 未知',
                `**分類** · ${categoryLabel}`,
                quote.uuid && URL.canParse(`https://hitokoto.cn?uuid=${quote.uuid}`)
                    ? `[查看語錄來源](https://hitokoto.cn?uuid=${quote.uuid})`
                    : '',
            ].filter(Boolean).join('\n')

            await interaction.editReply({ components: [createMessage(content)] })
        } catch (error) {
            console.error('[quote] Failed to fetch quote:', error)
            await interaction.editReply({
                components: [createMessage('# 語錄暫時失聯\n語錄服務目前無法回應，請稍後再試。')],
            })
        }
    },
}
