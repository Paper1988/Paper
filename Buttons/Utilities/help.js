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

        const inviteMe = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('邀請我')
                .setStyle(ButtonStyle.Link)
                .setURL(
                    'https://discord.com/api/oauth2/authorize?client_id=***REMOVED***&permissions=1644971945463&scope=bot%20applications.commands'
                )
        )

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle('指令幫助')
            .setDescription(
                'Paper📄是一個多功能機器人，具備豐富且多樣的指令功能。\n無論你是想要`播放音樂`、`舉辦抽獎活動`、`管理伺服器`，還是尋找更多有趣和實用的功能，Paper📄都能滿足你的需求！'
            )
            .setTimestamp()
        await interaction.update({
            embeds: [embed],
            components: [helpMenu, inviteMe]
        })
    }
}
