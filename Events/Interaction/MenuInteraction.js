const { StringSelectMenuInteraction, Client, EmbedBuilder } = require('discord.js')

module.exports = {
    name: 'interactionCreate',
    /**
     *
     * @param {StringSelectMenuInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        if (!interaction.isStringSelectMenu()) return
        try {
            const Menu = await client.selectMenus.get(interaction.customId)

            if (!Menu)
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(
                                '<:outage_868122243845206087:1202112862990897172> | 找不到該下拉選單'
                            )
                    ],
                    ephemeral: true
                })

            Menu.execute(interaction, client)
        } catch (err) {
            console.log(err)
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
