import type { ButtonType } from '@/typings/component.js'
import { ButtonInteraction } from 'discord.js'

export default {
    id: 'close-message',
    async execute(interaction: ButtonInteraction) {
        // 嘗試刪除訊息，如果沒有權限則隱藏
        try {
            await interaction.message.delete()
        } catch {
            await interaction.update({ components: [], embeds: [], content: '訊息已關閉。' })
        }
    }
} satisfies ButtonType
