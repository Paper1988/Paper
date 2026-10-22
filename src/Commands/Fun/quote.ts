import {
    ChatInputCommandInteraction,
    ContainerBuilder,
    MessageFlags,
    SlashCommandBuilder,
    TextDisplayBuilder,
} from 'discord.js'

const API_URL = 'https://v0.elegant.tw/'
const ACCENT_COLOR = 0xA3A3A3

const CATEGORIES: Record<number, string> = {
    1: '日本動漫',
    2: '遊戲',
    3: '歐美卡通',
    4: '電影',
    5: '影集',
    6: '網路',
    7: '諺語',
    8: '文學',
    9: '毒雞湯',
}

interface ElegantQuoteResponse {
    id?: number
    sentence?: string
    category?: number
    cite?: string | null
    author?: string | null
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
        .setDescription('Get a random Traditional Chinese quote')
        .setDescriptionLocalization('zh-TW', '取得一句繁體中文語錄')
        .setDescriptionLocalization('ja', 'ランダムな名言を取得'),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply({
            components: [createMessage('# 今日語錄\n正在尋找一句值得收藏的話…')],
            flags: MessageFlags.IsComponentsV2,
        })

        try {
            const response = await fetch(API_URL, {
                headers: { Accept: 'application/json' },
                signal: AbortSignal.timeout(8_000),
            })

            if (!response.ok) throw new Error(`Elegant TW API returned HTTP ${response.status}`)

            const quote = (await response.json()) as ElegantQuoteResponse
            if (typeof quote.sentence !== 'string' || !quote.sentence.trim()) {
                throw new Error('Elegant TW API returned an empty quote')
            }

            const attribution = [quote.author?.trim(), quote.cite?.trim()]
                .filter((value): value is string => Boolean(value))
                .join(' · ')
            const categoryLabel = typeof quote.category === 'number'
                ? CATEGORIES[quote.category] ?? '其他'
                : '語錄'
            const content = [
                '# 今日語錄',
                `> ${quote.sentence.slice(0, 1_500)}`,
                '',
                attribution
                    ? `**出處** · ${attribution.slice(0, 250)}`
                    : '**出處** · 未知',
                `**分類** · ${categoryLabel}`,
                '[語錄來源 · 言雅 Elegant TW](https://elegant.tw/)',
            ].join('\n')

            await interaction.editReply({ components: [createMessage(content)] })
        } catch (error) {
            console.error('[quote] Failed to fetch quote:', error)
            await interaction.editReply({
                components: [createMessage('# 語錄暫時失聯\n語錄服務目前無法回應，請稍後再試。')],
            })
        }
    },
}
