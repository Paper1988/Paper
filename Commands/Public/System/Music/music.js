const { SlashCommandBuilder } = require('discord.js')
const { defaultFilters } = require('distube')
const { SoundCloudPlugin } = require('@distube/soundcloud')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('一個完善的音樂系統')
        .addSubcommand((sub) =>
            sub
                .setName('play')
                .setDescription('播放音樂')
                .addStringOption((options) =>
                    options
                        .setName('query')
                        .setDescription('請提供有效連結或關鍵字')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addBooleanOption((options) =>
                    options.setName('skip').setDescription('是否跳過目前的歌曲').setRequired(false)
                )
                .addNumberOption((options) =>
                    options
                        .setName('position')
                        .setDescription('請提供歌曲位置(數字)')
                        .setRequired(false)
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName('volume')
                .setDescription('調整音量大小')
                .addNumberOption((options) =>
                    options
                        .setName('percent')
                        .setDescription('請提供音量(數字)')
                        .setRequired(true)
                        .setMinValue(0)
                        .setMaxValue(200)
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName('seek')
                .setDescription('跳到歌曲中的某個時間點')
                .addNumberOption((options) =>
                    options
                        .setName('time')
                        .setDescription('請提供時間（以秒為單位，例如: 120，即2分鐘）')
                        .setRequired(true)
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName('filters')
                .setDescription('增添/移除過濾器')
                .addStringOption((options) =>
                    options
                        .setName('set')
                        .setDescription('請選擇過濾器')
                        .setRequired(true)
                        .addChoices(
                            { name: '移除所有過濾器', value: 'false' },
                            ...Object.keys(defaultFilters).map((k) => ({ name: k, value: k }))
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
                            { name: '切換重複播放', value: 'repeat' },
                            { name: '離開語音頻道', value: 'quit' }
                        )
                )
        ),
    usage: '/music (play, volume, settings, seek, filters, jump)',
    async autocomplete(interaction, client) {
        // 檢查是否為 "play" 子指令的自動完成
        if (interaction.commandName === 'music' && interaction.options.getSubcommand() === 'play') {
            const scPlugin = new SoundCloudPlugin()
            const value = interaction.options.getFocused().toString().trim()

            // 確保搜索字符串不是空的
            if (!value) {
                // 如果是空的，可以選擇回應一些預設選項或不回應
                return interaction.respond([]) // 不回應任何選項
            }

            if (value.startsWith('https://')) {
                return interaction.respond([])
            }

            let choices = []
            // 假設有一個搜索功能可以返回歌曲列表
            await scPlugin
                .search(value)
                .then((results) => {
                    choices = results.map((song, id) => ({
                        name: `${song.name}`,
                        value: `${song.name}`
                    }))
                })
                .catch(async (error) => {
                    // 處理錯誤，例如通過回應一些預設選項或顯示錯誤信息
                    await client.distube.search(value).then((results) => {
                        choices = results.map((song, id) => ({
                            name: `${song.name}`,
                            value: `${song.name}`
                        }))
                    })
                })

            // 篩選出包含用戶輸入值的選項
            const filtered = choices
                .filter((choice) => choice.name.toLowerCase().includes(value.toLowerCase()))
                .slice(0, 10)

            // 回應用戶輸入，提供選項列表
            await interaction.respond(filtered)
        }
    }
}
