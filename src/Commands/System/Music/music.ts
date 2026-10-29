import { PaperClient } from '@/Structures/classes/PaperClient.js'
import { cacheGetJson, cacheSetJsonWithTTL } from '@/libs/utils/redis.js'
import { randomUUID } from 'crypto'
import { AutocompleteInteraction, SlashCommandBuilder } from 'discord.js'
import type { SearchResult, Track } from 'moonlink.js'

const CACHE_DURATION = 60 * 1000

function formatDuration(ms: number): string {
    const seconds = Math.floor((ms / 1000) % 60)
    const minutes = Math.floor((ms / (1000 * 60)) % 60)
    const hours = Math.floor(ms / (1000 * 60 * 60))

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

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
                /* .addNumberOption((option) =>
                    option
                        .setName('position')
                        .setNameLocalization('zh-TW', '位置')
                        .setNameLocalization('ja', '位置')
                        .setDescription('Position in queue')
                        .setDescriptionLocalization('zh-TW', '在播放清單中的位置')
                        .setDescriptionLocalization('ja', 'キューでの位置')
                ) */
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
                .addStringOption((options) =>
                    options
                        .setName('time')
                        .setNameLocalization('zh-TW', '時間')
                        .setNameLocalization('ja', '時間')
                        .setDescription(
                            'Please provide the time (format: mm:ss or seconds, e.g., "02:00", "00:30", "120")'
                        )
                        .setDescriptionLocalization(
                            'zh-TW',
                            '請提供時間（格式：mm:ss 或 秒數，例如：「02:00」, 「00:30」, 「120」）'
                        )
                        .setDescriptionLocalization(
                            'ja',
                            '時間（形式：mm:ss または 秒数、例：「02:00」, 「00:30」, 「120」）'
                        )
                        .setRequired(true)
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
        )
        .addSubcommandGroup((group) =>
            group
                .setName('dj')
                .setNameLocalization('zh-TW', 'DJ身份組')
                .setNameLocalization('ja', 'DJロール')
                .setDescription('Configure the DJ role for this server')
                .setDescriptionLocalization('zh-TW', '設定此伺服器的 DJ 身份組')
                .setDescriptionLocalization('ja', 'このサーバーのDJロールを設定します')
                .addSubcommand((sub) =>
                    sub
                        .setName('create')
                        .setNameLocalization('zh-TW', '建立並綁定')
                        .setNameLocalization('ja', '作成して紐付け')
                        .setDescription('Create a role and bind it as the DJ role')
                        .setDescriptionLocalization('zh-TW', '建立身份組並直接綁定為 DJ 身份組')
                        .setDescriptionLocalization('ja', 'ロールを作成しDJロールとして紐付けます')
                        .addStringOption((option) =>
                            option
                                .setName('name')
                                .setNameLocalization('zh-TW', '名稱')
                                .setNameLocalization('ja', '名前')
                                .setDescription('Role name (defaults to DJ)')
                                .setDescriptionLocalization('zh-TW', '身份組名稱，預設為 DJ')
                                .setDescriptionLocalization('ja', 'ロール名（デフォルトはDJ）')
                                .setMaxLength(100)
                                .setRequired(false)
                        )
                )
                .addSubcommand((sub) =>
                    sub
                        .setName('bind')
                        .setNameLocalization('zh-TW', '綁定')
                        .setNameLocalization('ja', '紐付け')
                        .setDescription('Bind an existing role as the DJ role')
                        .setDescriptionLocalization('zh-TW', '將既有身份組綁定為 DJ 身份組')
                        .setDescriptionLocalization('ja', '既存のロールをDJロールとして紐付けます')
                        .addRoleOption((option) =>
                            option
                                .setName('role')
                                .setNameLocalization('zh-TW', '身份組')
                                .setNameLocalization('ja', 'ロール')
                                .setDescription('The role to bind')
                                .setDescriptionLocalization('zh-TW', '要綁定的身份組')
                                .setDescriptionLocalization('ja', '紐付けるロール')
                                .setRequired(true)
                        )
                )
                .addSubcommand((sub) =>
                    sub
                        .setName('unbind')
                        .setNameLocalization('zh-TW', '解除綁定')
                        .setNameLocalization('ja', '紐付け解除')
                        .setDescription('Unbind the current DJ role')
                        .setDescriptionLocalization('zh-TW', '解除目前 DJ 身份組的綁定')
                        .setDescriptionLocalization('ja', '現在のDJロールの紐付けを解除します')
                )
        ),
    async autocomplete(interaction: AutocompleteInteraction, client: PaperClient) {
        const value = interaction.options.getFocused().toString().trim()

        if (!client.moonlink) return await interaction.respond([])

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

                const cacheKey = `music:trending:${regionCode}`
                let cachedResults = await cacheGetJson<{
                    choices: { name: string; value: string }[]
                    timestamp: number
                }>(cacheKey)

                if (cachedResults && Date.now() - cachedResults.timestamp < CACHE_DURATION * 1000) {
                    return await interaction.respond(cachedResults.choices)
                }

                let trendingQuery: string
                switch (regionCode) {
                    case 'TW':
                        trendingQuery = '台灣流行音樂 最新'
                        break
                    case 'JP':
                        trendingQuery = '日本流行音楽 最新'
                        break
                    case 'KR':
                        trendingQuery = '한국 인기 음악'
                        break
                    case 'CN':
                        trendingQuery = '中国流行音乐 最新'
                        break
                    default:
                        trendingQuery = 'popular music trending'
                }

                const trendingResults = (await client.moonlink.search({
                    query: trendingQuery,
                    requester: interaction.user.id
                })) as SearchResult

                if (!trendingResults.tracks.length) {
                    return await interaction.respond([])
                }

                const trendingChoices = await Promise.all(
                    trendingResults.tracks.slice(0, 20).map(async (track) => {
                        const token = 'tk_' + randomUUID().replace(/-/g, '').slice(0, 12)

                        await cacheSetJsonWithTTL(
                            `music:track:${interaction.user.id}:${token}`,
                            {
                                title: track.title,
                                author: track.author,
                                duration: track.duration,
                                uri: track.uri,
                                identifier: track.identifier,
                                thumbnail: track.artworkUrl,
                                sourceName: track.sourceName
                            },
                            CACHE_DURATION / 1000
                        )

                        const duration = formatDuration(track.duration)
                        const name = `🔥 ${track.title} [${duration}]`

                        return {
                            name: name.length > 100 ? name.substring(0, 97) + '...' : name,
                            value: token
                        }
                    })
                )

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

            if (value.startsWith('https://') || value.startsWith('http://')) {
                return await interaction.respond([
                    {
                        name: value,
                        value: value
                    }
                ])
            }

            const searchTerm = value.replace(/\s+/g, ' ').trim()

            const searchCacheKey = `music:search:${interaction.user.id}:${Buffer.from(searchTerm).toString('base64').slice(0, 100)}`
            let cachedSearchResults = await cacheGetJson<{
                choices: { name: string; value: string }[]
                timestamp: number
            }>(searchCacheKey)

            if (
                cachedSearchResults &&
                Date.now() - cachedSearchResults.timestamp < CACHE_DURATION * 1000
            ) {
                const filtered = cachedSearchResults.choices
                    .filter((choice) => {
                        const searchLower = value.toLowerCase()
                        const titleLower = choice.name.toLowerCase()

                        if (titleLower.includes(searchLower)) return true

                        const searchTerms = searchLower.split(/\s+/)
                        return searchTerms.every((term) => titleLower.includes(term))
                    })
                    .slice(0, 20)

                return await interaction.respond(filtered)
            }

            const results = await client.moonlink.search({
                query: searchTerm,
                requester: interaction.user.id
            })

            if (!results.tracks.length) {
                return await interaction.respond([
                    {
                        name: '❌ 找不到任何結果',
                        value: '_no_results'
                    }
                ])
            }

            const choices = await Promise.all(
                results.tracks.slice(0, 25).map(async (track: Track) => {
                    const token = 'tk_' + randomUUID().replace(/-/g, '').slice(0, 12)

                    await cacheSetJsonWithTTL(
                        `music:track:${interaction.user.id}:${token}`,
                        {
                            title: track.title,
                            author: track.author,
                            duration: track.duration,
                            uri: track.uri,
                            identifier: track.identifier,
                            thumbnail: track.artworkUrl,
                            sourceName: track.sourceName
                        },
                        CACHE_DURATION / 1000
                    )

                    const duration = formatDuration(track.duration)
                    const name = `${track.title} [${duration}]`

                    return {
                        name: name.length > 100 ? name.substring(0, 97) + '...' : name,
                        value: token
                    }
                })
            )

            await cacheSetJsonWithTTL(
                searchCacheKey,
                {
                    choices,
                    timestamp: Date.now()
                },
                CACHE_DURATION / 1000
            )

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
