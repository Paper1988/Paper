const { MessageFlags } = require('discord.js')
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const Playlist = require('../../../Structures/Schemas/Playlist')
const { emojis } = require('../../../libs/emoji/emoji')

module.exports = {
    id: 'playlist-import',
    async execute(interaction) {
        try {
            const [_, playlistId, action] = interaction.customId.split(':')

            // 如果是取消操作
            if (action === 'cancel') {
                return await interaction
                    .update({
                        content: `${emojis.correct} | 已取消匯入播放清單`,
                        components: []
                    })
                    .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
            }

            // 獲取原始播放清單
            const sourcePlaylist = await Playlist.findById(playlistId)
            if (!sourcePlaylist) {
                return await interaction
                    .reply({
                        content: `${emojis.warning} | 找不到指定的播放清單`,
                        flags: MessageFlags.Ephemeral
                    })
                    .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
            }

            // 檢查是否為播放清單主人
            if (sourcePlaylist.userId === interaction.user.id) {
                return await interaction
                    .reply({
                        content: `${emojis.warning} | 這是你自己的播放清單`,
                        flags: MessageFlags.Ephemeral
                    })
                    .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
            }

            // 檢查是否為私人播放清單
            if (sourcePlaylist.isPrivate && sourcePlaylist.userId !== interaction.user.id) {
                return await interaction
                    .reply({
                        content: `${emojis.warning} | 這是私人播放清單`,
                        flags: MessageFlags.Ephemeral
                    })
                    .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
            }

            // 檢查用戶是否已有相同名稱的播放清單
            const existingPlaylist = await Playlist.findOne({
                userId: interaction.user.id,
                name: sourcePlaylist.name
            })

            if (existingPlaylist && !action) {
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`playlist-import:${playlistId}:overwrite`)
                        .setLabel('覆蓋')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId(`playlist-import:${playlistId}:cancel`)
                        .setLabel('取消')
                        .setEmoji('<:xmark:1265562550947545089>')
                        .setStyle(ButtonStyle.Secondary)
                )

                return await interaction.reply({
                    content: `${emojis.warning} | 你已經有一個名為 **${sourcePlaylist.name}** 的播放清單了\n是否要覆蓋原有的播放清單？`,
                    components: [row],
                    flags: MessageFlags.Ephemeral
                })
            }

            // 如果是覆蓋操作
            if (action === 'overwrite' && existingPlaylist) {
                existingPlaylist.description = `從 ${interaction.user.tag} 的播放清單匯入`
                existingPlaylist.songs = sourcePlaylist.songs
                await existingPlaylist.save()

                return await interaction.update({
                    content: `${emojis.correct} | 已覆蓋播放清單 **${sourcePlaylist.name}**\n共 ${sourcePlaylist.songs.length} 首歌曲`,
                    components: []
                })
            }

            // 創建新的播放清單
            const newPlaylist = new Playlist({
                userId: interaction.user.id,
                name: sourcePlaylist.name,
                description: `從 ${interaction.user.tag} 的播放清單匯入`,
                songs: sourcePlaylist.songs,
                isPrivate: true
            })

            await newPlaylist.save()

            await interaction.reply({
                content: `${emojis.correct} | 已將播放清單 **${sourcePlaylist.name}** 匯入到你的播放清單中\n共 ${sourcePlaylist.songs.length} 首歌曲`,
                flags: MessageFlags.Ephemeral
            })
        } catch (error) {
            console.error('匯入播放清單時發生錯誤:', error)
            await interaction
                .reply({
                    content: `${emojis.outage} | 匯入播放清單時發生錯誤`,
                    flags: MessageFlags.Ephemeral
                })
                .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
        }
    }
}
