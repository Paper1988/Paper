const {
    SlashCommandBuilder,
    MessageFlags,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction
} = require('discord.js')
const Playlist = require('../../../../../Structures/Schemas/Playlist')
const { emojis } = require('../../../../../libs/emoji/emoji')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playlist-import')
        .setNameLocalization('zh-TW', '播放清單-匯入')
        .setNameLocalization('ja', 'プレイリストをインポート')
        .setDescription('Import a playlist from file')
        .setDescriptionLocalization('zh-TW', '從檔案匯入播放清單')
        .setDescriptionLocalization('ja', 'ファイルからプレイリストをインポートします')
        .addAttachmentOption((opt) =>
            opt
                .setName('file')
                .setNameLocalization('zh-TW', '檔案')
                .setNameLocalization('ja', 'ファイル')
                .setDescription('The playlist file to import (JSON)')
                .setDescriptionLocalization('zh-TW', '要匯入的播放清單檔案 (JSON)')
                .setDescriptionLocalization('ja', 'インポートするプレイリストのファイル (JSON)')
                .setRequired(true)
        )
        .addStringOption((opt) =>
            opt
                .setName('name')
                .setNameLocalization('zh-TW', '名稱')
                .setNameLocalization('ja', '名前')
                .setDescription('New name for the playlist (optional)')
                .setDescriptionLocalization('zh-TW', '播放清單的新名稱 (選填)')
                .setDescriptionLocalization('ja', 'プレイリストの新しい名前 (任意)')
        ),
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     * @returns
     */
    async execute(interaction) {
        const file = interaction.options.getAttachment('file')
        const newName = interaction.options.getString('name')

        if (!file.name.endsWith('.json')) {
            return await interaction.reply({
                content: `${emojis.warning} | 請上傳 JSON 檔案`,
                flags: MessageFlags.Ephemeral
            })
        }

        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral })

            // 讀取檔案內容
            const response = await fetch(file.url)
            const importData = await response.json()

            // 驗證資料格式
            if (!importData.songs || !Array.isArray(importData.songs)) {
                return await interaction.editReply({
                    content: `${emojis.warning} | 無效的播放清單格式`
                })
            }

            // 檢查播放清單名稱是否已存在
            const playlistName = newName || importData.name
            const existingPlaylist = await Playlist.findOne({
                userId: interaction.user.id,
                name: playlistName
            })

            if (existingPlaylist) {
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`playlist-import:${playlistName}:overwrite`)
                        .setLabel('覆蓋')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId(`playlist-import:${playlistName}:cancel`)
                        .setLabel('取消')
                        .setEmoji('<:xmark:1265562550947545089>')
                        .setStyle(ButtonStyle.Secondary)
                )

                return await interaction.editReply({
                    content: `${emojis.warning} | 你已經有一個名為 **${playlistName}** 的播放清單了\n是否要覆蓋原有的播放清單？`,
                    components: [row]
                })
            }

            // 建立新的播放清單
            await createPlaylist(interaction, playlistName, importData)
        } catch (error) {
            console.error('匯入播放清單時發生錯誤:', error)
            await interaction.editReply({
                content: `${emojis.outage} | 匯入播放清單時發生錯誤`
            })
        }
    }
}

async function createPlaylist(interaction, playlistName, importData) {
    const playlist = await Playlist.create({
        userId: interaction.user.id,
        name: playlistName,
        description: importData.description,
        songs: importData.songs,
        isPrivate: true
    })

    await interaction.editReply({
        content: `<:download:1320298270739791973> | 成功匯入播放清單 **${playlistName}**\n<:todolist:1320296314071945267> 共 ${importData.songs.length} 首歌曲`,
        components: []
    })
}
