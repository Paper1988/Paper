import type { PaperClient } from '@/classes/PaperClient.js'
import { loadEvents } from '@/Structures/Handlers/eventHandler.js'
import type { SubCommandType } from '@/typings/command.js'
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js'

module.exports = {
    subCommand: 'reload.events',
    async execute(interaction: ChatInputCommandInteraction, client: PaperClient) {
        for (const [key, value] of client.events) client.removeListener(`${key}`, value)

        loadEvents(client)

        await interaction.reply({
            content: '<:correct:1265560254708711467> | 成功載入Events!',
            flags: MessageFlags.Ephemeral
        })
    }
} as SubCommandType
