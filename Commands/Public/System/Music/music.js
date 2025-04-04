const { SlashCommandBuilder, AutocompleteInteraction, Collection } = require('discord.js')
const { defaultFilters } = require('distube')
const { YouTubePlugin } = require('@distube/youtube')

// 在檔案開頭添加快取相關的常數
const CACHE_DURATION = 30 * 60 * 1000 // 快取時間30分鐘
const trendingCache = new Collection()

module.exports = {
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
                            { name: '顯示播放清單', value: 'queue' },
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
    /**
     *
     * @param {AutocompleteInteraction} interaction
     * @returns
     */
    async autocomplete(interaction) {
        const yt = new YouTubePlugin()
        const value = interaction.options.getFocused().toString().trim()

        try {
            // 如果用戶還沒輸入任何內容，顯示熱門歌曲
            if (!value) {
                const userLocale = interaction.locale || 'zh-TW'
                let regionCode = 'TW' // 預設美國

                const regionMap = {
                    'zh-TW': 'TW',
                    'zh-CN': 'CN',
                    ja: 'JP',
                    ko: 'KR',
                    'en-US': 'US',
                    'en-GB': 'GB'
                }

                regionCode = regionMap[userLocale] || regionCode

                // 檢查快取
                const cacheKey = `trending_${regionCode}`
                const cachedResults = trendingCache.get(cacheKey)

                if (cachedResults && Date.now() - cachedResults.timestamp < CACHE_DURATION) {
                    return await interaction.respond(cachedResults.choices)
                }

                // 如果沒有快取或快取過期，重新獲取
                let trendingResults
                switch (regionCode) {
                    case 'TW':
                        trendingResults = await yt.search('台灣流行音樂 最新', { limit: 15 })
                        break
                    case 'JP':
                        trendingResults = await yt.search('日本流行音楽 最新', { limit: 15 })
                        break
                    case 'KR':
                        trendingResults = await yt.search('한국 인기 음악', { limit: 15 })
                        break
                    case 'CN':
                        trendingResults = await yt.search('中国流行音乐 最新', { limit: 15 })
                        break
                    default:
                        trendingResults = await yt.search('popular music trending', { limit: 15 })
                }

                const trendingChoices = trendingResults.map((song) => ({
                    name: `🔥 ${song.name.slice(0, 50)}`, // 限制長度，避免超出Discord限制
                    value: song.name
                }))

                // 儲存到快取
                trendingCache.set(cacheKey, {
                    choices: trendingChoices,
                    timestamp: Date.now()
                })

                return await interaction.respond(trendingChoices)
            }

            // 如果是URL，不提供建議
            if (value.startsWith('https://') || value.startsWith('http://')) {
                return await interaction.respond([])
            }

            // 一般搜尋
            let choices = []
            try {
                // 對搜尋詞進行處理
                const searchTerm = value
                    .replace(/\s+/g, ' ') // 將多個空格轉換為單個空格
                    .trim()

                const results = await yt.search(searchTerm, {
                    limit: 15,
                    type: 'video'
                })

                choices = results.map((song) => ({
                    name: `${song.name}`.slice(0, 90),
                    value: song.name // 保留完整名稱作為值
                }))
            } catch (searchError) {
                console.error('搜尋時發生錯誤:', searchError)
                return await interaction.respond([])
            }

            // 改進搜尋結果過濾邏輯
            const filtered = choices
                .filter((choice) => {
                    const searchLower = value.toLowerCase()
                    const titleLower = choice.name.toLowerCase()

                    // 檢查完整字串匹配
                    if (titleLower.includes(searchLower)) return true

                    // 檢查所有關鍵字是否都匹配
                    const searchTerms = searchLower.split(/\s+/)
                    return searchTerms.every((term) => titleLower.includes(term))
                })
                .slice(0, 15)

            return await interaction.respond(filtered)
        } catch (error) {
            console.error('音樂搜尋時發生錯誤:', error)
            return await interaction.respond([])
        }
    }
}
