import { ChatInputCommandInteraction } from 'discord.js'

async function results(deletedMessages, interaction: ChatInputCommandInteraction) {
    const results = {}
    for (const [, deleted] of deletedMessages) {
        const user = `${deleted.author.username}#${deleted.author.discriminator}`
        if (!results[user]) results[user] = 0
        results[user]++
    }

    const userMessageMap = Object.entries(results)

    const finalResult = `<:clean:1265560229438029915>移除了\`${
        deletedMessages.size
    }\`則訊息!\n\n${userMessageMap
        .map(([user, messages]) => `**${user}** : ${messages}`)
        .join('\n')}`

    const msg = await interaction.reply({
        content: `${finalResult}`
    })
    setTimeout(() => {
        msg.delete()
    }, 5000)
}

export default results
