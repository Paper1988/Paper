import { deleteMessageAfter } from '@/Systems/Music.js'
import results from '@/Systems/PurgeFunction.js'
import emojis from '@/libs/emoji/emoji.js'
import {
    ChatInputCommandInteraction,
    Collection,
    Message,
    MessageFlags,
    type PartialMessage,
    TextChannel
} from 'discord.js'

export default {
    subCommand: 'purge.user',
    async execute(interaction: ChatInputCommandInteraction) {
        let amount = interaction.options.getInteger('count') ?? 0
        if (amount > 100) amount = 100
        const channel = interaction.channel as TextChannel
        const fetch = await channel.messages.fetch({ limit: amount })
        if (fetch.size === 0) {
            return interaction
                .reply({
                    content: `${emojis.warning} | 沒有訊息可以清除！`,
                    flags: MessageFlags.Ephemeral
                })
                .then(deleteMessageAfter)
        }
        const user = interaction.options.getUser('user')

        const filtered: Collection<string, Message<boolean>> = fetch.filter(
            (m: Message) => m.author.id === user?.id
        )
        if (filtered.size === 0) {
            return interaction.reply({
                content: `${emojis.warning} | 找不到該使用者可清除的訊息。`,
            }).then(deleteMessageAfter)
        }
        const deletedMessages: Collection<string, Message<boolean> | PartialMessage | undefined> =
            await channel.bulkDelete(filtered, true)
        results(deletedMessages, interaction, `清除指定使用者訊息：${user?.tag ?? user?.id ?? '未知使用者'}`)
    }
}
