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
        if (interaction.customId === 'report:send') return
        if (interaction.customId === 'report:cancel') return
        if (interaction.customId === 'report:solved') return
        if (interaction.customId === 'rps_r') return
        if (interaction.customId === 'rps_p') return
        if (interaction.customId === 'rps_s') return
        if (interaction.customId === 'approve_accept') return
        if (interaction.customId === 'approve_reject') return

        try {
            const Button = await client.buttons.get(interaction.customId)
            if (!Button)
                return await interaction.reply({
                    content:
                        '<:warning_908958943466893323:1201844340276862976> | 這個按鈕不存在或過期了!',
                    ephemeral: true
                })

            if (Button.permission && !interaction.member.permissions.has(Button.permission))
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(
                                '<:warning_908958943466893323:1201844340276862976> | 你沒有權限使用!'
                            )
                    ],
                    ephemeral: true
                })

            Button.execute(interaction, client)
        } catch (err) {
            console.log('[Button]' + err)
            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(
                            '<:outage_868122243845206087:1202112862990897172> | 發生未知錯誤，請協助回報!'
                        )
                ],
                ephemeral: true
            })
        }
    }
}
