import type { CommandType } from '@/typings/command.js'
import { PermissionsBitField, SlashCommandBuilder } from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setNameLocalization('zh-TW', '抽獎系統')
        .setNameLocalization('ja', '抽選システム')
        .setDescription('The main menu of the giveaway system')
        .setDescriptionLocalization('zh-TW', '抽獎系統主選單')
        .setDescriptionLocalization('ja', '抽選システムメインメニュー')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
        .addSubcommand((subcommand) =>
            subcommand
                .setName('menu')
                .setNameLocalization('zh-TW', '主選單')
                .setNameLocalization('ja', 'メインメニュー')
                .setDescription('View the main menu of the giveaway system')
                .setDescriptionLocalization('zh-TW', '查看抽獎系統主選單')
                .setDescriptionLocalization('ja', '抽獎システムのメインメニューを表示する')
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('notification')
                .setNameLocalization('zh-TW', '通知')
                .setNameLocalization('ja', '通知')
                .setDescription('Set up giveaway notifications')
                .setDescriptionLocalization('zh-TW', '設定抽獎通知')
                .setDescriptionLocalization('ja', '抽選通知を設定する')
        )
} as CommandType
