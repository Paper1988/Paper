import {
    ChatInputCommandInteraction,
    Collection,
    Message,
    type MessageResolvable,
    type PartialMessage,
    TextChannel
} from 'discord.js'
import results from '../../../Systems/PurgeFunction'
import emojis from '../../../libs/emoji/emoji'

export default {
    subCommand: 'purge.user',
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
        const user = interaction.options.getUser('user')

        let filtered: number | Collection<string, Message<boolean>> | readonly MessageResolvable[]
        let deletedMessages: Collection<string, Message<boolean> | PartialMessage | undefined>
        filtered = fetch.filter((m: Message) => m.author.id === user?.id)
        deletedMessages = await channel.bulkDelete(filtered, true)
        results(deletedMessages, interaction)
    }
}
