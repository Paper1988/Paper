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
        if (interaction.customId === 'mcstats_refresh') return
        if (interaction.customId === 'report:send') return
        if (interaction.customId === 'report:cancel') return
        if (interaction.customId === 'unban:confirm') return
        if (interaction.customId === 'unban:cancel') return
        try {
            const buttonCustomId = interaction.customId.split('_')
            const Button = client.buttons.get(buttonCustomId[0])
            if (!Button)
                return interaction.reply({
                    content:
                        '<:warning_908958943466893323:1201844340276862976> | 這個按鈕不存在或過期了!',
                    ephemeral: true
                })

            if (Button.permission && !interaction.member.permissions.has(Button.permission))
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('RED')
                            .setDescription(
                                '<:warning_908958943466893323:1201844340276862976> | 你沒有權限使用!'
                            )
                    ],
                    ephemeral: true
                })

            Button.execute(interaction, client, buttonCustomId.slice(1))
        } catch (err) {
            console.log(err)
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('RED')
                        .setDescription(
                            '<:outage_868122243845206087:1202112862990897172> | 發生未知錯誤，請協助回報!'
                        )
                ],
                ephemeral: true
            })
        }
    }
}
