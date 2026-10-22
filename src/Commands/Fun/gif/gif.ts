import { SlashCommandBuilder } from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('gif')
        .setNameLocalization('zh-TW', 'gif')
        .setNameLocalization('ja', 'gif')
        .setDescription('Randomly generate a gif')
        .setDescriptionLocalization('zh-TW', '隨機產生gif動圖')
        .setDescriptionLocalization('ja', 'ランダムにgifを生成します')
        .addSubcommand((sub) =>
            sub
                .setName('bite')
                .setNameLocalization('zh-TW', '咬')
                .setNameLocalization('ja', '噛む')
                .setDescription('Bite someone!')
                .setDescriptionLocalization('zh-TW', '咬一口某人!')
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
                .setNameLocalization('zh-TW', '擁抱')
                .setNameLocalization('ja', '抱擁')
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
                .setNameLocalization('zh-TW', '殺')
                .setNameLocalization('ja', '殺す')
                .setDescription('Kill someone!')
                .setDescriptionLocalization('zh-TW', '殺了某人!')
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
                .setNameLocalization('zh-TW', '親吻')
                .setNameLocalization('ja', 'キスする')
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
        .addSubcommand((sub) =>
            sub
                .setName('wave')
                .setNameLocalization('zh-TW', '揮手')
                .setNameLocalization('ja', '手を振る')
                .setDescription('Wave hello!')
                .setDescriptionLocalization('zh-TW', '揮手打個招呼')
                .setDescriptionLocalization('ja', '手を振って挨拶する')
        )
        .addSubcommand((sub) =>
            sub
                .setName('smile')
                .setNameLocalization('zh-TW', '微笑')
                .setNameLocalization('ja', '笑顔')
                .setDescription('Share a smile!')
                .setDescriptionLocalization('zh-TW', '來個可愛的微笑')
                .setDescriptionLocalization('ja', '笑顔を見せる')
        )
        .addSubcommand((sub) =>
            sub
                .setName('blush')
                .setNameLocalization('zh-TW', '害羞')
                .setNameLocalization('ja', '照れる')
                .setDescription('Blush!')
                .setDescriptionLocalization('zh-TW', '害羞一下')
                .setDescriptionLocalization('ja', '照れる')
        )
        .addSubcommand((sub) =>
            sub
                .setName('cry')
                .setNameLocalization('zh-TW', '哭哭')
                .setNameLocalization('ja', '泣く')
                .setDescription('Cry it out!')
                .setDescriptionLocalization('zh-TW', '哭一下')
                .setDescriptionLocalization('ja', '泣く')
        )
        .addSubcommand((sub) =>
            sub
                .setName('wink')
                .setNameLocalization('zh-TW', '眨眼')
                .setNameLocalization('ja', 'ウインク')
                .setDescription('Give a wink!')
                .setDescriptionLocalization('zh-TW', '俏皮地眨眨眼')
                .setDescriptionLocalization('ja', 'ウインクする')
        )
        .addSubcommand((sub) =>
            sub
                .setName('highfive')
                .setNameLocalization('zh-TW', '擊掌')
                .setNameLocalization('ja', 'ハイタッチ')
                .setDescription('High-five someone!')
                .setDescriptionLocalization('zh-TW', '和某人擊掌')
                .setDescriptionLocalization('ja', '誰かとハイタッチする')
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
                .setName('handhold')
                .setNameLocalization('zh-TW', '牽手')
                .setNameLocalization('ja', '手をつなぐ')
                .setDescription('Hold someone's hand!')
                .setDescriptionLocalization('zh-TW', '牽起某人的手')
                .setDescriptionLocalization('ja', '誰かと手をつなぐ')
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
                .setName('glomp')
                .setNameLocalization('zh-TW', '飛撲')
                .setNameLocalization('ja', '飛びつく')
                .setDescription('Glomp someone!')
                .setDescriptionLocalization('zh-TW', '飛撲抱住某人')
                .setDescriptionLocalization('ja', '誰かに飛びつく')
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
                .setName('poke')
                .setNameLocalization('zh-TW', '戳戳')
                .setNameLocalization('ja', 'つつく')
                .setDescription('Poke someone!')
                .setDescriptionLocalization('zh-TW', '戳戳某人')
                .setDescriptionLocalization('ja', '誰かをつつく')
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
                .setName('nom')
                .setNameLocalization('zh-TW', '啊嗚')
                .setNameLocalization('ja', 'あむ')
                .setDescription('Nom someone!')
                .setDescriptionLocalization('zh-TW', '啊嗚一口某人')
                .setDescriptionLocalization('ja', '誰かをあむっとする')
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
