const {
    ButtonInteraction,
    ActionRowBuilder,
    ButtonStyle,
    ButtonBuilder,
    EmbedBuilder,
    StringSelectMenuBuilder
} = require('discord.js')

module.exports = {
    id: 'help:back',
    /**
     * @param {ButtonInteraction} interaction
     */
    async execute(interaction) {
        if (!interaction.customId === 'help:back') return
        const helpMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('helpMenu')
                .setPlaceholder('選擇一個分類')
                .addOptions(
                    {
                        label: '🔧功能',
                        description: '顯示所有功能指令',
                        value: 'General'
                    },

                    {
                        label: '🔒管理',
                        description: '顯示所有管理指令(只有管理員和版主等人可以使用)',
                        value: 'Moderation'
                    },

                    {
                        label: '🎶音樂',
                        description: '顯示所有音樂指令',
                        value: 'Music'
                    },

                    {
                        label: '🎁抽獎',
                        description: '顯示所有抽獎指令',
                        value: 'Giveaway'
                    },

                    {
                        label: '🎭 娛樂',
                        description: '顯示所有娛樂指令',
                        value: 'Fun'
                    }
                )
        )

        const inviteAndSupport = new ActionRowBuilder().addComponents([
            new ButtonBuilder()
                .setLabel('邀請我')
                .setStyle(ButtonStyle.Link)
                .setURL(
                    'https://discord.com/api/oauth2/authorize?client_id=869166906765103135&permissions=1644971945463&scope=bot%20applications.commands'
                ),
            new ButtonBuilder()
                .setLabel('支援伺服器')
                .setStyle(ButtonStyle.Link)
                .setURL('https://discord.gg/6qCTEer4pT')
        ])

        const koFi = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('請我喝杯咖啡')
                .setEmoji('<:kofi:1308733627496009738>')
                .setStyle(ButtonStyle.Link)
                .setURL('https://ko-fi.com/paper1988')
        )

        const Embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle('📚 Paper 指令導覽')
            .setDescription(
                '歡迎使用 Paper！我是一個功能豐富的多功能機器人 🤖\n\n' +
                    '**主要功能：**\n' +
                    '🎵 高品質音樂播放系統\n' +
                    '🎉 互動式抽獎活動\n' +
                    '🛡️ 完善的伺服器管理工具\n' +
                    '🎮 有趣的娛樂指令\n' +
                    '🌐 實用的工具功能\n\n' +
                    '**使用方式：**\n' +
                    '• 在下方選單選擇想了解的分類\n' +
                    '• 所有指令皆支援斜線指令 `/`\n' +
                    '• 需要協助可以加入支援伺服器'
            )
            .setFooter({ text: '選擇下方分類以查看詳細指令說明' })
            .setTimestamp()

        await interaction.reply({
            embeds: [Embed],
            components: [helpMenu, inviteAndSupport, koFi]
        })
    }
}
