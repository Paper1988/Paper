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
     * @param {ButtonInteraction} i
     */
    async execute(i) {
        if (!i.customId === 'help:back') return

        const helpMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('helpMenu')
                .setPlaceholder('選擇一個分類')
                .addOptions(
                    {
                        label: '🔧功能',
                        description: '顯示所有功能指令',
                        value: 'Utilities'
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
                    'https://discord.com/api/oauth2/authorize?client_id=869166906765103135&permissions=1644971945463&scope=bot%20applications.commands'
                )
        )

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle('指令幫助')
            .setDescription(
                'Paper📄是一個多功能機器人，有許多指令，像是：音樂、抽獎、管理以及更多有趣的指令等你來發現！'
            )
            .setTimestamp()
        await i.update({ embeds: [embed], components: [helpMenu, inviteMe] })
    }
}
