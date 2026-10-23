import { deleteMessageAfter } from '@/Systems/Music.js'
import { sendModeratorLog } from '@/Systems/ModeratorLog.js'
import { ChatInputCommandInteraction } from 'discord.js'

async function results(\n    deletedMessages,\n    interaction: ChatInputCommandInteraction,\n    action = '清除訊息'\n) {
    await sendModeratorLog(interaction, {\n        action,\n        details: [`頻道：<#${interaction.channelId}>`, `刪除數量：${deletedMessages.size}`]\n    })\n\n    const messageCounts = {}
    for (const [, deleted] of deletedMessages) {
        if (!deleted?.author) continue\n        const user = deleted.author.tag || deleted.author.username
        if (!messageCounts[user]) messageCounts[user] = 0
        messageCounts[user]++
    }

    const userMessageMap = Object.entries(messageCounts)

    const finalResult = `<:clean:1265560229438029915>移除了\`${
        deletedMessages.size
    }\`則訊息!\n\n${userMessageMap
        .map(([user, messages]) => `**${user}** : ${messages}`)
        .join('\n')}`

    const msg = await interaction.reply({
        content: `${finalResult}`
    })
    deleteMessageAfter(msg, 10 * 1000)
}

export default results
