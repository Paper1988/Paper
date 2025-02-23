const Playlist = require('../../../Structures/Schemas/Playlist')
const { emojis } = require('../../../libs/emoji/emoji')

module.exports = {
    id: 'playlist-delete',
    async execute(interaction) {
        const [_, playlistName, action] = interaction.customId.split(':')

        try {
            if (action === 'cancel') {
                return await interaction.update({
                    content: `${emojis.correct} | 已取消刪除播放清單`,
                    components: []
                })
            }

            const playlist = await Playlist.findOne({
                userId: interaction.user.id,
                name: playlistName
            })

            if (!playlist) {
                return await interaction.update({
                    content: `${emojis.warning} | 找不到指定的播放清單`,
                    components: []
                })
            }

            await playlist.deleteOne()

            await interaction.update({
                content: `<:delete:1265560264061882471> | 已刪除播放清單 **${playlistName}**`,
                components: []
            })
        } catch (error) {
            console.error('處理播放清單刪除按鈕時發生錯誤:', error)
            await interaction.update({
                content: `${emojis.outage} | 處理播放清單刪除時發生錯誤`,
                components: []
            })
        }
    }
}
