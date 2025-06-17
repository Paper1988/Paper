import type { CommandType } from '@/typings/command.js'
import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'

export default {
    developer: true,
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('重新載入指令/事件(僅限開發人員)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((subcommand) => subcommand.setName('events').setDescription('載入Events'))
        .addSubcommand((subcommand) =>
            subcommand.setName('commands').setDescription('載入Commands')
        )
} as CommandType
