const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    Client,
    EmbedBuilder,
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js')
const MaintenanceDB = require('../../Structures/Schemas/MaintenanceDB')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('maintenance')
        .setDescription('切換維護模式')
        .addBooleanOption((options) =>
            options.setName('view').setDescription('查看維護狀態').setRequired(true)
        ),
    developer: true,
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const view = interaction.options.getBoolean('view')

        const Data = MaintenanceDB.findOne({ ClientId: client.user.id })

        const modal = new ModalBuilder().setCustomId('maintenance').setTitle('切換維護模式')

        const toggleInput = new TextInputBuilder()
            .setCustomId('maintenanceToggle')
            .setLabel('請選擇是否開啟維護模式')
            .setPlaceholder('請輸入True/False')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

        const descriptionInput = new TextInputBuilder()
            .setCustomId('maintenanceDescription')
            .setLabel('請輸入維護狀態/原因')
            .setPlaceholder('請輸入狀態/原因')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)

        const firstActionRow = new ActionRowBuilder().addComponents(toggleInput)
        const secondActionRow = new ActionRowBuilder().addComponents(descriptionInput)

        modal.addComponents(firstActionRow, secondActionRow)

        if (view) {
            const Embed = new EmbedBuilder()
                .setTitle('<:discordstaff:1094236985318707221> | 維護模式')
                .setAuthor({
                    name: interaction.user.username,
                    iconURL: interaction.user.avatarURL()
                })
                .setDescription(
                    `目前維護模式： ${Data.Maintenance}\n狀態/原因： ${Data.Description}`
                )
                .setTimestamp()
                .setFooter({ text: client.user.username, iconURL: client.user.avatarURL() })
                .setColor('Blurple')

            return await interaction.reply({ embeds: [Embed], ephemeral: true })
        } else {
            await interaction.showModal(modal)
        }
    }
}
