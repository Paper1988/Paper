import type { CommandType } from '@/typings/command.js'
import { SlashCommandBuilder } from 'discord.js'

export default {
    developer: true,
    data: new SlashCommandBuilder()
        .setName('blacklist')
        .setDescription('黑名單指令(僅限開發人員)')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('user')
                .setDescription('封鎖用戶')
                .addNumberOption((options) =>
                    options.setName('user-id').setDescription('輸入使用者的ID').setRequired(true)
                )
                .addStringOption((options) => options.setName('reason').setDescription('輸入原因'))
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('guild')
                .setDescription('封鎖一個伺服器')
                .addNumberOption((options) =>
                    options.setName('guild-id').setDescription('輸入伺服器的ID').setRequired(true)
                )
                .addStringOption((options) => options.setName('reason').setDescription('輸入原因'))
        )
} as CommandType
