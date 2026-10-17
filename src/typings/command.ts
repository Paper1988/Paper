import { PaperClient } from '@/Structures/classes/PaperClient.js'
import type {
    AutocompleteInteraction,
    ChatInputApplicationCommandData,
    ChatInputCommandInteraction,
    CommandInteraction,
    ContextMenuCommandBuilder,
    ContextMenuCommandInteraction,
    SlashCommandBuilder
} from 'discord.js'

type execute = (
    interaction: CommandInteractionType,
    client?: PaperClient
) => Promise<void | unknown>

type CommandInteractionType =
    | ChatInputCommandInteraction
    | ContextMenuCommandInteraction
    | CommandInteraction
    | AutocompleteInteraction

export type CommandType = {
    data?: SlashCommandBuilder | ContextMenuCommandBuilder
    subCommand?: boolean
    developer?: boolean
    helpCategory?: 'General' | 'Moderation' | 'Music' | 'Giveaway' | 'Fun'
    execute: execute
    autocomplete?: execute
} & ChatInputApplicationCommandData

export type SubCommandType = {
    subCommand: string
    developer?: boolean
    execute: execute
} & ChatInputApplicationCommandData
