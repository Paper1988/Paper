import type { CommandType } from '@/typings/command.js'
import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('mod-log')
        .setNameLocalization('zh-TW', '管理日誌')
        .setDescription('Configure the moderator audit log channel')
        .setDescriptionLocalization('zh-TW', '設定管理操作的紀錄頻道')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand((subcommand) =>
            subcommand
                .setName('setup')
                .setNameLocalization('zh-TW', '設定')
                .setDescription('Set the moderator log channel')
                .setDescriptionLocalization('zh-TW', '設定管理日誌頻道')
                .addChannelOption((option) =>
                    option
                        .setName('channel')
                        .setNameLocalization('zh-TW', '頻道')
                        .setDescription('Choose a text channel for moderation logs')
                        .setDescriptionLocalization('zh-TW', '選擇接收管理操作紀錄的文字頻道')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('reset')
                .setNameLocalization('zh-TW', '重設')
                .setDescription('Disable moderator logging')
                .setDescriptionLocalization('zh-TW', '停用管理操作紀錄')
        )
} as CommandType
