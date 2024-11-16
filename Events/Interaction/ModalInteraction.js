const { Client, ModalSubmitInteraction, EmbedBuilder } = require('discord.js')

module.exports = {
    name: 'interactionCreate',
    /**
     * @param {ModalSubmitInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        if (!interaction.isModalSubmit()) return
        try {
            const CustomId = interaction.customId.split('/')
            const Modal = await client.modals.get(CustomId[0])

            if (!Modal)
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setDescription('<:outage:1265561329528471613> | 找不到該Modal')
                    ],
                    ephemeral: true
                })

            if (Modal.permission && !interaction.member.permissions.has(Modal.permission))
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setDescription('<:warning:1265562532857380936> | 你沒有權限使用!')
                    ],
                    ephemeral: true
                })

            let dev
            if (Modal.developers === true) dev = interaction.user.id !== '538639229220028416'
            if (dev)
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Blue')
                            .setDescription(
                                '<:warning:1265562532857380936> | 這項Modal僅限於開發人員使用!'
                            )
                    ],
                    ephemeral: true
                })

            Modal.execute(interaction, client, CustomId.slice(1, -1))
        } catch (err) {
            console.log('[Modal]' + err)
            return interaction.reply({
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
