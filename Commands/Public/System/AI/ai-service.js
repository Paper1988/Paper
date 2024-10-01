const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ai-service')
        .setDescription('使用各類AI模型')
        /* .addStringOption((options) =>
            options.setName('prompt').setDescription('請提供訊息').setRequired(true)
        ) */
        .addSubcommand((sub) =>
            sub
                .setName('chat-gpt')
                .setDescription('使用由GPT-4o驅動的語言模型')
                .addStringOption((options) =>
                    options.setName('prompt').setDescription('請提供提示').setRequired(true)
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName('prodia')
                .setDescription('使用由Prodia驅動的圖像生成器')
                .addStringOption((options) =>
                    options.setName('prompt').setDescription('請提供提示').setRequired(true)
                )
                /* .addStringOption((options) =>
                    options
                        .setName('style')
                        .setDescription('請選擇圖片風格')
                        .setRequired(true)
                        .setChoices([
                            { name: '3D模特', value: '3d-model' },
                            { name: '類比電影', value: 'analog-film' },
                            { name: '動漫', value: 'anime' },
                            { name: '劇院', value: 'cinematic' },
                            { name: '漫畫', value: 'comic-book' },
                            { name: '數位', value: 'digital-art' },
                            { name: '增強', value: 'enhance' },
                            { name: '奇幻', value: 'fantasy-art' },
                            { name: '線條', value: 'line-art' },
                            { name: '霓虹龐克', value: 'neon-punk' },
                            { name: '攝影', value: 'photographic' },
                            { name: '像素', value: 'pixel-art' }
                        ])
                ) */
                .addStringOption((options) =>
                    options
                        .setName('negative-prompt')
                        .setDescription('請提供負向提示(不想在圖片中出現的元素)')
                        .setRequired(false)
                )
                .addIntegerOption((options) =>
                    options
                        .setName('number')
                        .setDescription('請提供生成圖片的數量[預設為2]')
                        .setRequired(false)
                )
        )
}
