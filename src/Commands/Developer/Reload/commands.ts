import type { PaperClient } from '@/classes/PaperClient.js'
import type { SubCommandType } from '@/typings/command.js'
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js'
import { loadCommands } from '../../../Structures/Handlers/commandHandler.js'

module.exports = {
    subCommand: 'reload.commands',
    async execute(interaction: ChatInputCommandInteraction, client: PaperClient) {
        loadCommands(client)

        await interaction.reply({
            content: '<:correct:1265560254708711467> | 成功載入Commands!',
            flags: MessageFlags.Ephemeral
        })
    }
} as SubCommandType
