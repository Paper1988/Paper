const { ModalSubmitInteraction, Client } = require('discord.js')
const MaintenanceDB = require('../Structures/Schemas/MaintenanceDB.js')

module.exports = {
    id: 'maintenance',
    /**
     * @param {ModalSubmitInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const toggle = interaction.fields.getTextInputValue('maintenanceToggle')
        const description = interaction.fields.getTextInputValue('maintenanceDescription')

        let Data = await MaintenanceDB.findOne({ ClientId: client.user.id })
        if (!Data) {
            Data = new MaintenanceDB({
                ClientId: client.user.id
            })
        }

        Data.Maintenance = toggle
        Data.Description = description

        await Data.save()

        if (Data.Maintenance === 'True') {
            return await interaction.reply({
                content: '<:correct_859388130411282442:1201843648229294121> | 維護模式已開啟',
                ephemeral: true
            })
        } else if (Data.Maintenance === 'False') {
            await Data.deleteOne({ ClientId: client.user.id, Description: Data.Description })
            return await interaction.reply({
                content: '<:xmark_988409378161954866:1201844342029815848> | 維護模式已關閉',
                ephemeral: true
            })
        }
    }
}
