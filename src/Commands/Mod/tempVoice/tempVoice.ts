import type { CommandType } from '@/typings/command.js'
import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('temp-voice')
        .setNameLocalization('zh-TW', '臨時語音')
        .setNameLocalization('ja', '一時ボイス')
        .setDescription('Configure join-to-create voice channels')
        .setDescriptionLocalization('zh-TW', '設定自動建立語音頻道')
        .setDescriptionLocalization('ja', '参加で自動作成されるボイスチャンネルを設定')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addSubcommand((sub) =>
            sub
                .setName('setup')
                .setNameLocalization('zh-TW', '設定')
                .setNameLocalization('ja', '設定')
                .setDescription('Create the lobby channel and category')
                .setDescriptionLocalization('zh-TW', '建立大廳頻道與類別')
                .setDescriptionLocalization('ja', 'ロビーチャンネルとカテゴリーを作成')
                .addStringOption((o) =>
                    o
                        .setName('name')
                        .setNameLocalization('zh-TW', '名稱')
                        .setNameLocalization('ja', '名前')
                        .setDescription('Name template, use {user} for the member name')
                        .setDescriptionLocalization('zh-TW', '名稱格式，{user} 會換成成員名稱')
                        .setDescriptionLocalization('ja', '名前の形式、{user} はメンバー名に置き換わります')
                        .setMaxLength(80)
                )
                .addIntegerOption((o) =>
                    o
                        .setName('limit')
                        .setNameLocalization('zh-TW', '人數上限')
                        .setNameLocalization('ja', '人数制限')
                        .setDescription('Default user limit (0 = unlimited)')
                        .setDescriptionLocalization('zh-TW', '預設人數上限（0 = 無限制）')
                        .setDescriptionLocalization('ja', 'デフォルトの人数制限（0 = 無制限）')
                        .setMinValue(0)
                        .setMaxValue(99)
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName('disable')
                .setNameLocalization('zh-TW', '停用')
                .setNameLocalization('ja', '無効化')
                .setDescription('Disable join-to-create and remove the lobby')
                .setDescriptionLocalization('zh-TW', '停用並移除大廳頻道')
                .setDescriptionLocalization('ja', '無効化してロビーを削除')
        )
} as CommandType
