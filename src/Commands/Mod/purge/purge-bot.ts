import { deleteMessageAfter } from '@/Systems/Music.js'
import results from '@/Systems/PurgeFunction.js'
import emojis from '@/libs/emoji/emoji.js'
import {
    ChatInputCommandInteraction,
    Collection,
    Message,
    type MessageResolvable,
    type PartialMessage,
    TextChannel
} from 'discord.js'

export default {
    subCommand: 'purge.bot',
    async execute(interaction: ChatInputCommandInteraction) {
        let amount = interaction.options.getInteger('count') ?? 0
        if (amount > 100) amount = 100
        const channel = interaction.channel as TextChannel
        const fetch = await channel.messages.fetch({ limit: amount })
        if (fetch.size === 0) {
            return interaction
                .reply({
                    content: `${emojis.warning} | 沒有訊息可以清除！`
                })
                .then(deleteMessageAfter)
        }

        const filtered:
            | number
            | Collection<string, Message<boolean>>
            | readonly MessageResolvable[] = fetch.filter((m: Message) => m.author.bot)
        const deletedMessages: Collection<string, Message<boolean> | PartialMessage | undefined> =
            await channel.bulkDelete(filtered, true)
        results(deletedMessages, interaction, '清除機器人訊息')
    }
}
