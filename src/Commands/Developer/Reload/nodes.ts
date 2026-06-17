import type { PaperClient } from '@/Structures/classes/PaperClient'
import type { SubCommandType } from '@/typings/command'
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js'

export default {
    subCommand: 'reload.nodes',
    async execute(interaction: ChatInputCommandInteraction, client: PaperClient) {
        if (!client.moonlink) {
            await interaction.reply({
                content: '<:error:1265560254708711467> | 音樂節點未啟用!',
                flags: MessageFlags.Ephemeral
            })
            return
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral })

        const identifiers = [...client.moonlink.nodes.nodes.keys()]
        for (const identifier of identifiers) {
            client.moonlink.nodes.remove(identifier)
        }

        client.moonlink.nodes.init()

        await interaction.editReply({
            content: `<:correct:1265560254708711467> | 已重新連線 ${identifiers.length} 個節點!`
        })
    }
} as SubCommandType
