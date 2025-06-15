import type { CommandType } from '@/typings/command'
import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setNameLocalization('zh-TW', '清除訊息')
        .setNameLocalization('ja', 'メッセージ削除')
        .setDescription('Clear messages from a user or channel')
        .setDescriptionLocalization('zh-TW', '清除頻道或特定用戶的訊息')
        .setDescriptionLocalization('ja', 'ユーザーまたはチャンネルのメッセージを削除')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addSubcommand((subcommand) =>
            subcommand
                .setName('all')
                .setNameLocalization('zh-TW', '全部')
                .setNameLocalization('ja', 'すべて')
                .setDescription('Remove specified number of messages')
                .setDescriptionLocalization('zh-TW', '刪除指定數量的訊息')
                .setDescriptionLocalization('ja', '指定された数のメッセージを削除')
                .addIntegerOption((options) =>
                    options
                        .setName('count')
                        .setNameLocalization('zh-TW', '數量')
                        .setNameLocalization('ja', '数')
                        .setDescription('Please provide the number of messages to remove')
                        .setDescriptionLocalization('zh-TW', '請輸入要刪除的訊息數量')
                        .setDescriptionLocalization(
                            'ja',
                            '削除するメッセージの数を入力してください'
                        )
                        .setMinValue(1)
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('user')
                .setNameLocalization('zh-TW', '用戶')
                .setNameLocalization('ja', 'ユーザー')
                .setDescription('Delete messages from a specific user')
                .setDescriptionLocalization('zh-TW', '刪除特定用戶的訊息')
                .setDescriptionLocalization('ja', '特定ユーザーのメッセージを削除')
                .addIntegerOption((options) =>
                    options
                        .setName('count')
                        .setNameLocalization('zh-TW', '數量')
                        .setNameLocalization('ja', '数')
                        .setDescription('Please provide the number of messages to remove')
                        .setDescriptionLocalization('zh-TW', '請輸入要刪除的訊息數量')
                        .setDescriptionLocalization(
                            'ja',
                            '削除するメッセージの数を入力してください'
                        )
                        .setMinValue(1)
                        .setRequired(true)
                )
                .addUserOption((options) =>
                    options
                        .setName('user')
                        .setNameLocalization('zh-TW', '用戶')
                        .setNameLocalization('ja', 'ユーザー')
                        .setDescription('請選擇用戶')
                        .setDescriptionLocalization('zh-TW', '請選擇用戶')
                        .setDescriptionLocalization('ja', 'ユーザーを選択してください')
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('bot')
                .setNameLocalization('zh-TW', '機器人')
                .setNameLocalization('ja', 'ボット')
                .setDescription('Delete messages from bots')
                .setDescriptionLocalization('zh-TW', '刪除機器人的訊息')
                .setDescriptionLocalization('ja', 'ボットのメッセージを削除')
                .addIntegerOption((options) =>
                    options
                        .setName('count')
                        .setNameLocalization('zh-TW', '數量')
                        .setNameLocalization('ja', '数')
                        .setDescription('Please provide the number of messages to remove')
                        .setDescriptionLocalization('zh-TW', '請輸入要刪除的訊息數量')
                        .setDescriptionLocalization(
                            'ja',
                            '削除するメッセージの数を入力してください'
                        )
                        .setMinValue(1)
                        .setRequired(true)
                )
        )
} as CommandType
