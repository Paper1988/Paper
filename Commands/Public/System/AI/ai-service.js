const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ai')
        .setNameLocalization('zh-TW', 'ai')
        .setNameLocalization('ja', 'ai')
        .setDescription('Use various AI models')
        .setDescriptionLocalization('zh-TW', '使用各類AI模型')
        .setDescriptionLocalization('ja', 'AIモデルを使用します')
        .addSubcommand((sub) =>
            sub
                .setName('chat-gpt')
                .setNameLocalization('zh-TW', 'chat-gpt')
                .setNameLocalization('ja', 'chat-gpt')
                .setDescription('Use the language model powered by GPT-4o')
                .setDescriptionLocalization('zh-TW', '使用由GPT-4o驅動的語言模型')
                .setDescriptionLocalization('ja', 'GPT-4o駆動の言語モデルを使用します')
                .addStringOption((options) =>
                    options
                        .setName('prompt')
                        .setNameLocalization('zh-TW', '提示')
                        .setNameLocalization('ja', 'プロンプト')
                        .setDescription('Please provide a prompt')
                        .setDescriptionLocalization('zh-TW', '請提供提示')
                        .setDescriptionLocalization('ja', 'プロンプトを提供してください')
                        .setRequired(true)
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName('prodia')
                .setNameLocalization('zh-TW', 'prodia')
                .setNameLocalization('ja', 'prodia')
                .setDescription('Use the image generator powered by Prodia')
                .setDescriptionLocalization('zh-TW', '使用由Prodia驅動的圖像生成器')
                .setDescriptionLocalization('ja', 'Prodia駆動の画像生成器を使用します')
                .addStringOption((options) =>
                    options
                        .setName('prompt')
                        .setNameLocalization('zh-TW', '提示')
                        .setNameLocalization('ja', 'プロンプト')
                        .setDescription('請提供提示')
                        .setDescriptionLocalization('zh-TW', '請提供提示')
                        .setDescriptionLocalization('ja', 'プロンプトを提供してください')
                        .setRequired(true)
                )
                .addStringOption((options) =>
                    options
                        .setName('negative-prompt')
                        .setNameLocalization('zh-TW', '負向提示')
                        .setNameLocalization('ja', '負向プロンプト')
                        .setDescription(
                            "Please provide a negative prompt (elements you don't want to appear in the image)"
                        )
                        .setDescriptionLocalization(
                            'zh-TW',
                            '請提供負向提示(不想在圖片中出現的元素)'
                        )
                        .setDescriptionLocalization(
                            'ja',
                            '負向プロンプト(画像に表示したくない要素)'
                        )
                        .setRequired(false)
                )
                .addIntegerOption((options) =>
                    options
                        .setName('number')
                        .setNameLocalization('zh-TW', '數量')
                        .setNameLocalization('ja', '数')
                        .setDescription(
                            'Please provide the number of images to generate [default is 2]'
                        )
                        .setDescriptionLocalization('zh-TW', '請提供生成圖片的數量[預設為2]')
                        .setDescriptionLocalization(
                            'ja',
                            '生成する画像の数を提供してください [デフォルトは2]'
                        )
                        .setRequired(false)
                )
        )
}
