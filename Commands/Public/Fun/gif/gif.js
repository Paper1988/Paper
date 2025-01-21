const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gif')
        .setNameLocalization('zh-TW', 'gif')
        .setNameLocalization('ja', 'gif')
        .setDescription('Randomly generate a gif')
        .setDescriptionLocalization('zh-TW', '隨機產生一張gif動圖')
        .setDescriptionLocalization('ja', 'ランダムにgifを生成します')
        .addSubcommand((sub) =>
            sub
                .setName('bite')
                .setNameLocalization('zh-TW', '咬')
                .setNameLocalization('ja', '噛む')
                .setDescription('Bite someone!')
                .setDescriptionLocalization('zh-TW', '咬某人一口!')
                .setDescriptionLocalization('ja', '噛む!')
                .addUserOption((option) =>
                    option
                        .setName('member')
                        .setNameLocalization('zh-TW', '用戶')
                        .setNameLocalization('ja', 'ユーザー')
                        .setDescription('Please select a member')
                        .setDescriptionLocalization('zh-TW', '請選擇一名用戶')
                        .setDescriptionLocalization('ja', 'メンバーを選択してください')
                        .setRequired(true)
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName('dance')
                .setNameLocalization('zh-TW', '跳舞')
                .setNameLocalization('ja', 'ダンス')
                .setDescription('Dance!')
                .setDescriptionLocalization('zh-TW', '跳舞!')
                .setDescriptionLocalization('ja', 'ダンス!')
        )
        .addSubcommand((sub) =>
            sub
                .setName('hug')
                .setDescription('Hug someone!')
                .setDescriptionLocalization('zh-TW', '擁抱某人!')
                .setDescriptionLocalization('ja', '抱きしめる!')
                .addUserOption((option) =>
                    option
                        .setName('member')
                        .setNameLocalization('zh-TW', '用戶')
                        .setNameLocalization('ja', 'ユーザー')
                        .setDescription('Please select a member')
                        .setDescriptionLocalization('zh-TW', '請選擇一名用戶')
                        .setDescriptionLocalization('ja', 'メンバーを選択してください')
                        .setRequired(true)
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName('kill')
                .setDescription('Kill someone!')
                .setDescriptionLocalization('zh-TW', '殺掉某人!')
                .setDescriptionLocalization('ja', '殺られる!')
                .addUserOption((option) =>
                    option
                        .setName('member')
                        .setNameLocalization('zh-TW', '用戶')
                        .setNameLocalization('ja', 'ユーザー')
                        .setDescription('Please select a member')
                        .setDescriptionLocalization('zh-TW', '請選擇一名用戶')
                        .setDescriptionLocalization('ja', 'メンバーを選択してください')
                        .setRequired(true)
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName('kiss')
                .setDescription('Kiss someone!')
                .setDescriptionLocalization('zh-TW', '親吻某人!')
                .setDescriptionLocalization('ja', 'キスする!')
                .addUserOption((option) =>
                    option
                        .setName('member')
                        .setNameLocalization('zh-TW', '用戶')
                        .setNameLocalization('ja', 'ユーザー')
                        .setDescription('Please select a member')
                        .setDescriptionLocalization('zh-TW', '請選擇一名用戶')
                        .setDescriptionLocalization('ja', 'メンバーを選択してください')
                        .setRequired(true)
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName('pat')
                .setDescription('Pat someone on the head!')
                .setDescriptionLocalization('zh-TW', '摸摸某人!')
                .setDescriptionLocalization('ja', '撫でる!')
                .addUserOption((option) =>
                    option
                        .setName('member')
                        .setNameLocalization('zh-TW', '用戶')
                        .setNameLocalization('ja', 'ユーザー')
                        .setDescription('Please select a member')
                        .setDescriptionLocalization('zh-TW', '請選擇一名用戶')
                        .setDescriptionLocalization('ja', 'メンバーを選択してください')
                        .setRequired(true)
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName('punch')
                .setDescription('Punch someone in their face!')
                .setDescriptionLocalization('zh-TW', '揍爆某人!')
                .setDescriptionLocalization('ja', '殴る!')
                .addUserOption((option) =>
                    option
                        .setName('member')
                        .setNameLocalization('zh-TW', '用戶')
                        .setNameLocalization('ja', 'ユーザー')
                        .setDescription('Please select a member')
                        .setDescriptionLocalization('zh-TW', '請選擇一名用戶')
                        .setDescriptionLocalization('ja', 'メンバーを選択してください')
                        .setRequired(true)
                )
        )
}
