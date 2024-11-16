const { ButtonInteraction, Client, EmbedBuilder } = require('discord.js')

module.exports = {
    name: 'interactionCreate',
    /**
     *
     * @param {ButtonInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        if (!interaction.isButton()) return
        if (interaction.customId === 'mcstats:refresh') return
        if (interaction.customId.startsWith('report')) return
        if (interaction.customId.startsWith('rps_')) return
        if (interaction.customId.startsWith('approve_')) return
        if (interaction.customId.startsWith('unban')) return
        if (interaction.customId.startsWith('TicTacToe_')) return

        try {
            const buttonCustomId = interaction.customId.split('/')
            const Button = await client.buttons.get(buttonCustomId[0])
            if (!Button)
                return await interaction.reply({
                    content: '<:warning:1265562532857380936> | 這個按鈕不存在或過期了!',
                    ephemeral: true
                })

            if (Button.permission && !interaction.member.permissions.has(Button.permission))
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setDescription('<:warning:1265562532857380936> | 你沒有權限使用!')
                    ],
                    ephemeral: true
                })

            Button.execute(interaction, client, buttonCustomId.slice(1, -1))
        } catch (err) {
            console.log('[Button] ' + err)
            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('<:outage:1265561329528471613> | 發生未知錯誤，請協助回報!')
                ],
                ephemeral: true
            })
        }
    }
}
