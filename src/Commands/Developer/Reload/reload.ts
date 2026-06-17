import type { CommandType } from '@/typings/command.js'
import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'

export default {
    developer: true,
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('(僅限開發人員)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((subcommand) => subcommand.setName('events').setDescription('...'))
        .addSubcommand((subcommand) => subcommand.setName('commands').setDescription('...'))
        .addSubcommand((subcommand) => subcommand.setName('nodes').setDescription('...'))
} as CommandType
