import results from '@/Systems/PurgeFunction.js'
import emojis from '@/libs/emoji/emoji.js'
import {
    ChatInputCommandInteraction,
    Collection,
    Message,
    type PartialMessage,
    TextChannel
} from 'discord.js'

export default {
    subCommand: 'purge.all',
    async execute(interaction: ChatInputCommandInteraction) {
        let amount = interaction.options.getInteger('count') ?? 0
        if (amount > 100) amount = 100
        const channel = interaction.channel as TextChannel
        const fetch = await channel.messages.fetch({ limit: amount })
        if (fetch.size === 0) {
            return interaction.reply({
                content: `${emojis.warning} | 沒有訊息可以清除！`,
                flags: 64 // Ephemeral
            })
        }

        const deletedMessages: Collection<string, Message<boolean> | PartialMessage | undefined> =
            await channel.bulkDelete(fetch, true)
        results(deletedMessages, interaction)
    }
}
