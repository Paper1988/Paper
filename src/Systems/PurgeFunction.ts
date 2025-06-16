import { deleteMessageAfter } from '@/Systems/Music'
import { ChatInputCommandInteraction } from 'discord.js'

async function results(deletedMessages, interaction: ChatInputCommandInteraction) {
    const messageCounts = {}
    for (const [, deleted] of deletedMessages) {
        const user = `${deleted.author.username}#${deleted.author.discriminator}`
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
