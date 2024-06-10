const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    Client,
    EmbedBuilder
} = require('discord.js')
const MaintenanceDB = require('../../Structures/Schemas/MaintenanceDB.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('toggle-maintenance')
        .setDescription('切換維護模式')
        .setDMPermission(false)
        .addBooleanOption((options) =>
            options.setName('toggle').setDescription('切換維護模式').setRequired(false)
        )
        .addStringOption((options) =>
            options.setName('description').setDescription('維護狀態/原因').setRequired(false)
        ),
    developer: true,
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const maintenance = interaction.options.getBoolean('toggle') || undefined
        const description = interaction.options.getString('description') || '無提供'

        let Data = await MaintenanceDB.findOne({ Client: client.user.id })
        if (!Data) {
            Data = new MaintenanceDB({
                ClientId: client.user.id,
                Description: description
            })
            await Data.save()
        }

        const Embed = new EmbedBuilder()
            .setTitle('<:discordstaff:1094236985318707221> | 維護模式')
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.avatarURL()
            })
            .setDescription(`目前維護模式： ${Data.Maintenance}\n狀態/原因： ${Data.Description}`)
            .setTimestamp()
            .setColor('Blurple')

        if (maintenance === undefined) {
            return await interaction.reply({ embeds: [Embed], ephemeral: true })
        } else Data.Maintenance = maintenance

        if (Data.Maintenance) {
            await interaction.reply({
                content: '<:correct_859388130411282442:1201843648229294121> | 維護模式已開啟',
                ephemeral: true
            })
        } else {
            await interaction.reply({
                content: '<:xmark_988409378161954866:1201844342029815848> | 維護模式已關閉',
                ephemeral: true
            })
        }
        return await Data.save()
    }
}
