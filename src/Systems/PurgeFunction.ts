import { deleteMessageAfter } from '@/Systems/Music.js'
import { sendModeratorLog } from '@/Systems/ModeratorLog.js'
import type { ChatInputCommandInteraction } from 'discord.js'

async function results(
    deletedMessages,
    interaction: ChatInputCommandInteraction,
    action = '清除訊息'
) {
    await sendModeratorLog(interaction, {
        action,
        details: [
            `頻道：<#${interaction.channelId}>`,
            `刪除數量：${deletedMessages.size}`
        ]
    })

    const messageCounts: Record<string, number> = {}
    for (const [, deleted] of deletedMessages) {
        if (!deleted?.author) continue
        const user = deleted.author.tag || deleted.author.username
        messageCounts[user] = (messageCounts[user] ?? 0) + 1
    }

    const userMessageMap = Object.entries(messageCounts)
    const finalResult = `<:clean:1265560229438029915>移除了\`${deletedMessages.size}\`則訊息!\n\n${userMessageMap
        .map(([user, messages]) => `**${user}** : ${messages}`)
        .join('\n')}`

    const msg = await interaction.reply({ content: finalResult })
    deleteMessageAfter(msg, 10 * 1000)
}

export default results
