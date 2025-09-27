import { YouTubePlugin } from '@distube/youtube'
import { AutocompleteInteraction, SlashCommandBuilder } from 'discord.js'
import { defaultFilters } from 'distube'
import { cacheSetJsonWithTTL, cacheGetJson } from '@/libs/utils/redis.js'
import { randomUUID } from 'crypto'

const CACHE_DURATION = 30 * 60 * 1000

export default {
    data: new SlashCommandBuilder()
        .setName('music')
        .setNameLocalization('zh-TW', '音樂')
        .setNameLocalization('ja', '音楽')
        .setDescription('Music system')
        .setDescriptionLocalization('zh-TW', '音樂系統')
        .setDescriptionLocalization('ja', '音楽システム')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('play')
                .setNameLocalization('zh-TW', '播放')
                .setNameLocalization('ja', '再生')
                .setDescription('Play a song')
                .setDescriptionLocalization('zh-TW', '播放一首歌')
                .setDescriptionLocalization('ja', '曲を再生します')
                .addStringOption((option) =>
                    option
                        .setName('search')
                        .setNameLocalization('zh-TW', '搜尋')
                        .setNameLocalization('ja', '検索')
                        .setDescription('Provide a song name or URL')
                        .setDescriptionLocalization('zh-TW', '提供歌曲名稱或網址')
                        .setDescriptionLocalization('ja', '曲名またはURLを入力してください')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addNumberOption((option) =>
                    option
                        .setName('position')
                        .setNameLocalization('zh-TW', '位置')
                        .setNameLocalization('ja', '位置')
                        .setDescription('Position in queue')
                        .setDescriptionLocalization('zh-TW', '在播放清單中的位置')
                        .setDescriptionLocalization('ja', 'キューでの位置')
                )
                .addBooleanOption((option) =>
                    option
                        .setName('skip')
                        .setNameLocalization('zh-TW', '跳過')
                        .setNameLocalization('ja', 'スキップ')
                        .setDescription('Skip current song')
                        .setDescriptionLocalization('zh-TW', '跳過目前歌曲')
                        .setDescriptionLocalization('ja', '現在の曲をスキップ')
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName('volume')
                .setNameLocalization('zh-TW', '音量')
                .setNameLocalization('ja', '音量')
                .setDescription('Adjust the volume size')
                .setDescriptionLocalization('zh-TW', '調整音量大小')
                .setDescriptionLocalization('ja', '音量を調整する')
                .addNumberOption((options) =>
                    options
                        .setName('percent')
                        .setNameLocalization('zh-TW', '百分比')
                        .setNameLocalization('ja', 'パーセント')
                        .setDescription('Please provide the volume size (1~200) [default is 50]')
                        .setDescriptionLocalization('zh-TW', '請提供音量大小 (1~200) [預設為50]')
                        .setDescriptionLocalization('ja', '音量サイズ (1~200) [デフォルトは50]')
                        .setRequired(true)
                        .setMinValue(0)
                        .setMaxValue(200)
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName('seek')
                .setNameLocalization('zh-TW', '時間')
                .setNameLocalization('ja', 'シーク')
                .setDescription('Jump to a specific time in the song')
                .setDescriptionLocalization('zh-TW', '跳到歌曲中的某個時間點')
                .setDescriptionLocalization('ja', '曲の特定の時間にジャンプ')
                .addNumberOption((options) =>
                    options
                        .setName('time')
                        .setNameLocalization('zh-TW', '時間')
                        .setNameLocalization('ja', '時間')
                        .setDescription(
                            'Please provide the time (in seconds, e.g., 120 for 2 minutes)'
                        )
                        .setDescriptionLocalization(
                            'zh-TW',
                            '請提供時間（以秒為單位，例如: 120，即2分鐘）'
                        )
                        .setDescriptionLocalization('ja', '時間（秒単位、例: 120は2分）')
                        .setRequired(true)
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName('filters')
                .setNameLocalization('zh-TW', '過濾器')
                .setNameLocalization('ja', 'フィルター')
                .setDescription('Add/Remove filters')
                .setDescriptionLocalization('zh-TW', '增添/移除過濾器')
                .setDescriptionLocalization('ja', 'フィルターを追加/削除')
                .addStringOption((options) =>
                    options
                        .setName('set')
                        .setNameLocalization('zh-TW', '選擇')
                        .setNameLocalization('ja', '選択')
                        .setDescription('Please select the filter')
                        .setDescriptionLocalization('zh-TW', '請選擇過濾器')
                        .setDescriptionLocalization('ja', 'フィルターを選択してください')
                        .setRequired(true)
                        .addChoices(
                            { name: '移除所有過濾器', value: 'false' },
                            ...Object.keys(defaultFilters).map((k) => ({
                                name: k,
                                value: k
                            })),
                            ...Object.keys({
                                // https://distube.js.org/types/DisTubeOptions.html
                                speed_050: 'atempo=0.5',
                                speed_075: 'atempo=0.75',
                                speed_1: 'atempo=1',
                                speed_125: 'atempo=1.25',
                                speed_150: 'atempo=1.5',
                                speed_175: 'atempo=1.75',
                                speed_2: 'atempo=2'
                            }).map((k) => ({ name: k, value: k }))
                        )
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName('jump')
                .setNameLocalization('zh-TW', '跳轉')
                .setNameLocalization('ja', 'ジャンプ')
                .setDescription(
                    'Jump to a position in the queue (next is 1, previous is -1, so on)'
                )
                .setDescriptionLocalization(
                    'zh-TW',
                    '跳到清單中的歌曲位置(下一首為1，上一首為-1，以此類推)'
                )
                .setDescriptionLocalization(
                    'ja',
                    'キュー内の位置にジャンプします（次は1、前は-1、以降同様）'
                )
                .addNumberOption((options) =>
                    options.setName('position').setDescription('請提供歌曲位置').setRequired(true)
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName('settings')
                .setNameLocalization('zh-TW', '選項')
                .setNameLocalization('ja', 'オプション')
                .setDescription('The options of the song')
                .setDescriptionLocalization('zh-TW', '⚙歌曲設定')
                .setDescriptionLocalization('ja', '⚙曲の設定')
                .addStringOption((options) =>
                    options
                        .setName('options')
                        .setDescription('請選擇一個控制項目')
                        .setRequired(true)
                        .addChoices(
                            { name: '顯示播放佇列', value: 'queue' },
                            { name: '播放上一首歌曲', value: 'previous' },
                            { name: '暫停/恢復播放歌曲', value: 'togglePause' },
                            { name: '跳過歌曲', value: 'skip' },
                            { name: '停止音樂', value: 'stop' },
                            { name: '隨機播放', value: 'shuffle' },
                            { name: '切換自動播放', value: 'autoplay' },
                            { name: '添加相似歌曲', value: 'related' },
                            { name: '切換重複播放', value: 'repeat' }
                        )
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName('quit')
                .setNameLocalization('zh-TW', '退出語音頻道')
                .setNameLocalization('ja', 'ボイスチャンネルを離れる')
                .setDescription('Quit the voice channel')
                .setDescriptionLocalization('zh-TW', '退出語音頻道')
                .setDescriptionLocalization('ja', 'ボイスチャンネルを離れる')
        ),
    async autocomplete(interaction: AutocompleteInteraction) {
        const yt = new YouTubePlugin()
        const value = interaction.options.getFocused().toString().trim()

        try {
            if (!value) {
                const userLocale = interaction.locale || 'zh-TW'
                let regionCode = 'TW'

                const regionMap = {
                    'zh-TW': 'TW',
                    'zh-CN': 'CN',
                    ja: 'JP',
                    ko: 'KR',
                    'en-US': 'US',
                    'en-GB': 'GB'
                }

                regionCode = regionMap[userLocale] || regionCode

                // 使用 Redis 快取來儲存熱門歌曲
                const cacheKey = `trending_${regionCode}`
                let cachedResults = await cacheGetJson<{
                    choices: { name: string; value: string }[]
                    timestamp: number
                }>(cacheKey)

                if (cachedResults && Date.now() - cachedResults.timestamp < CACHE_DURATION) {
                    return await interaction.respond(cachedResults.choices)
                }

                // 如果沒有快取或快取過期，重新獲取
                let trendingResults: any[]
                switch (regionCode) {
                    case 'TW':
                        trendingResults = await yt.search('台灣流行音樂 最新', { limit: 20 })
                        break
                    case 'JP':
                        trendingResults = await yt.search('日本流行音楽 最新', { limit: 20 })
                        break
                    case 'KR':
                        trendingResults = await yt.search('한국 인기 음악', { limit: 20 })
                        break
                    case 'CN':
                        trendingResults = await yt.search('中国流行音乐 最新', { limit: 20 })
                        break
                    default:
                        trendingResults = await yt.search('popular music trending', { limit: 20 })
                }

                const trendingChoices = await Promise.all(
                    trendingResults.slice(0, 20).map(async (song) => {
                        const token = 'tk_' + randomUUID().replace(/-/g, '').slice(0, 12)
                        await cacheSetJsonWithTTL(
                            `ac:track:${token}`,
                            {
                                value: song.url || song.name || 'unknown'
                            },
                            CACHE_DURATION / 1000
                        )
                        return { name: `🔥 ${song.name.slice(0, 90)}`, value: token }
                    })
                )

                // 儲存到 Redis 快取
                await cacheSetJsonWithTTL(
                    cacheKey,
                    {
                        choices: trendingChoices,
                        timestamp: Date.now()
                    },
                    CACHE_DURATION / 1000
                )

                return await interaction.respond(trendingChoices)
            }

            // 如果是URL，不提供建議
            if (value.startsWith('https://') || value.startsWith('http://')) {
                return await interaction.respond([])
            }

            // 一般搜尋
            let choices: { name: string; value: string }[] = []
            try {
                // 對搜尋詞進行處理
                const searchTerm = value
                    .replace(/\s+/g, ' ') // 將多個空格轉換為單個空格
                    .trim()

                // 使用 Redis 快取來儲存搜尋結果
                const searchCacheKey = `search_${Buffer.from(searchTerm).toString('base64')}`
                let cachedSearchResults = await cacheGetJson<{
                    choices: { name: string; value: string }[]
                    timestamp: number
                }>(searchCacheKey)

                if (
                    cachedSearchResults &&
                    Date.now() - cachedSearchResults.timestamp < CACHE_DURATION
                ) {
                    choices = cachedSearchResults.choices
                } else {
                    const results = await yt.search(searchTerm)

                    // 生成 token 並儲存歌曲資訊
                    const choicesWithTokens = await Promise.all(
                        results.map(async (song) => {
                            const token = 'tk_' + randomUUID().replace(/-/g, '').slice(0, 12)
                            await cacheSetJsonWithTTL(
                                `ac:track:${token}`,
                                {
                                    value: song.url || song.name || 'unknown'
                                },
                                CACHE_DURATION / 1000
                            )
                            return {
                                name: `${song.name}`.slice(0, 90),
                                value: token
                            }
                        })
                    )

                    choices = choicesWithTokens

                    // 儲存搜尋結果到 Redis 快取
                    await cacheSetJsonWithTTL(
                        searchCacheKey,
                        {
                            choices,
                            timestamp: Date.now()
                        },
                        CACHE_DURATION / 1000
                    )
                }
            } catch (searchError) {
                console.error('搜尋時發生錯誤:', searchError)
                return await interaction.respond([])
            }

            const filtered = choices
                .filter((choice) => {
                    const searchLower = value.toLowerCase()
                    const titleLower = choice.name.toLowerCase()

                    if (titleLower.includes(searchLower)) return true

                    const searchTerms = searchLower.split(/\s+/)
                    return searchTerms.every((term) => titleLower.includes(term))
                })
                .slice(0, 20)

            return await interaction.respond(filtered)
        } catch (error) {
            console.error('音樂搜尋時發生錯誤:', error)
            return await interaction.respond([])
        }
    }
}
