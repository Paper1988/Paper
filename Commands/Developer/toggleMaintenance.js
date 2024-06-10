const { SlashCommandBuilder, ChatInputCommandInteraction, Client } = require('discord.js')
const MaintenanceDB = require('../../Structures/Schemas/MaintenanceDB.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('toggle-maintenance')
        .setDescription('切換維護模式')
        .setDMPermission(false)
        .addBooleanOption((options) =>
            options.setName('toggle').setDescription('切換維護模式').setRequired(true)
        ),
    developer: true,
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const maintenance = interaction.options.getBoolean('maintenance')

        let Data = await MaintenanceDB.findOne({ Client: client.user.id })
        if (!Data) {
            Data = new MaintenanceDB({
                ClientId: client.user.id
            })
            await Data.save()
        }

        Data.Maintenance = maintenance

        if (Data.Maintenance) {
            await interaction.reply({ content: '維護模式已開啟', ephemeral: true })
        } else {
            await interaction.reply({ content: '維護模式已關閉', ephemeral: true })
        }
        return await Data.save()
    }
}
