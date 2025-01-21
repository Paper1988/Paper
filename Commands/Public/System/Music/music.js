const { SlashCommandBuilder, AutocompleteInteraction } = require('discord.js')
const { defaultFilters } = require('distube')
const { YouTubePlugin } = require('@distube/youtube')

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
                .setNameLocalization('zh-TW', '跳到')
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
                                speed_025: 'atempo=0.25',
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
                .setDescription('跳到清單中的歌曲位置(下一首為1，上一首為-1，以此類推)')
                .addNumberOption((options) =>
                    options.setName('position').setDescription('請提供歌曲位置').setRequired(true)
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName('settings')
                .setDescription('⚙歌曲設定')
                .addStringOption((options) =>
                    options
                        .setName('options')
                        .setDescription('請選擇一個選項')
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
        .addSubcommand((sub) => sub.setName('quit').setDescription('退出語音頻道')),
    usage: '/music (play, volume, settings, seek, filters, jump)',
    /**
     *
     * @param {AutocompleteInteraction} interaction
     * @returns
     */
    async autocomplete(interaction) {
        // 檢查是否為 "play" 子指令的自動完成
        const yt = new YouTubePlugin()
        const value = interaction.options.getFocused().toString().trim()

        // 確保搜索字符串不是空的
        if (!value || value.startsWith('https://' || 'http://')) {
            // 如果是空的，可以選擇回應一些預設選項或不回應
            return await interaction.respond([]) // 不回應任何選項
        }

        let choices = []
        // 假設有一個搜索功能可以返回歌曲列表
        await yt
            .search(value, { limit: 10 })
            .then((results) => {
                choices = results.map((song, id) => ({
                    name: `${song.name}`,
                    value: `${song.name}`
                }))
            })
            .catch((error) => {
                // 處理錯誤，例如通過回應一些預設選項或顯示錯誤信息
                return interaction.respond([])
            })

        // 篩選出包含用戶輸入值的選項
        const filtered = choices
            .filter((choice) => choice.name.toLowerCase().includes(value.toLowerCase()))
            .slice(0, 10)

        // 回應用戶輸入，提供選項列表
        return await interaction.respond(filtered)
    }
}
