const {
    Client,
    ChatInputCommandInteraction,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    SlashCommandBuilder,
    ButtonStyle
} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder().setName('invite').setDescription('邀請我加入你的伺服器!'),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const Invite = new EmbedBuilder()
            .setDescription('使用下面的按鈕來**讓我加入你的伺服器**或**加入我們的支援伺服器**！')
            .setColor('Blue')
            .setThumbnail(client.user.displayAvatarURL())
            .setAuthor({
                name: interaction.user.displayName,
                iconURL: interaction.user.displayAvatarURL()
            })

        const row = new ActionRowBuilder().addComponents([
            new ButtonBuilder()
                .setURL(
                    'https://discord.com/api/oauth2/authorize?client_id=***REMOVED***&permissions=1644971945463&scope=bot%20applications.commands'
                )
                .setLabel('點我邀請')
                .setStyle(ButtonStyle.Link),
            new ButtonBuilder()
                .setURL('https://discord.gg/6qCTEer4pT')
                .setLabel('支援伺服器')
                .setStyle(ButtonStyle.Link)
        ])
        await interaction.reply({ embeds: [Invite], components: [row] })
    }
}
