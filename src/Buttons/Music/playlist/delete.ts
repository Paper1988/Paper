import Playlist from '@/Structures/Schemas/Playlist.js'
import { deleteMessageAfter } from '@/Systems/Music.js'
import emojis from '@/libs/emoji/emoji.js'
import type { ButtonType } from '@/typings/component.js'
import type { ButtonInteraction } from 'discord.js'

export default {
    id: 'playlist-delete',
    async execute(interaction: ButtonInteraction) {
        const [_, playlistName, action] = interaction.customId.split(':')

        try {
            if (action === 'cancel') {
                return await interaction
                    .update({
                        content: `${emojis.correct} | 已取消刪除播放清單`,
                        components: []
                    })
                    .then(deleteMessageAfter)
            }

            const playlist = await Playlist.findOne({
                userId: interaction.user.id,
                name: playlistName
            })

            if (!playlist) {
                return await interaction
                    .update({
                        content: `${emojis.warning} | 找不到指定的播放清單`,
                        components: []
                    })
                    .then(deleteMessageAfter)
            }

            await playlist.deleteOne()

            await interaction.update({
                content: `<:delete:1265560264061882471> | 已刪除播放清單 **${playlistName}**`,
                components: []
            })
        } catch (error) {
            console.error('處理播放清單刪除按鈕時發生錯誤:', error)
            await interaction
                .update({
                    content: `${emojis.outage} | 處理播放清單刪除時發生錯誤`,
                    components: []
                })
                .then(deleteMessageAfter)
        }
    }
} satisfies ButtonType
