import type { CommandType } from '@/typings/command.js'
import { SlashCommandBuilder } from 'discord.js'

export default {
    developer: true,
    data: new SlashCommandBuilder()
        .setName('blacklist')
        .setDescription('(僅限開發人員)')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('user')
                .setDescription('...')
                .addNumberOption((options) =>
                    options.setName('user-id').setDescription('...').setRequired(true)
                )
                .addStringOption((options) => options.setName('reason').setDescription('...'))
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('guild')
                .setDescription('...')
                .addNumberOption((options) =>
                    options.setName('guild-id').setDescription('...').setRequired(true)
                )
                .addStringOption((options) => options.setName('reason').setDescription('...'))
        )
} as CommandType
