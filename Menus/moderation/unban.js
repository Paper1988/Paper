const {
    SelectMenuInteraction,
    Client,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    ActionRowBuilder
} = require('discord.js')

module.exports = {
    id: 'unban:selectMenu',
    /**
     *
     * @param {SelectMenuInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        if (interaction.isStringSelectMenu() && interaction.customId == 'unban:selectMenu') {
            const member = await client.users.fetch(interaction.values[0])

            const confirmationEmbed = new EmbedBuilder()
                .setColor('Blue')
                .setDescription(
                    `<:question_860133545905225768:1202218555844853760> | 你確定要解除封鎖 ${member} 嗎?`
                )
                .setFooter({
                    text: client.user.username,
                    iconURL: client.user.displayAvatarURL()
                })

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`unban:confirm/${member.id}`)
                    .setLabel('確認')
                    .setEmoji('<:correct_859388130411282442:1201843648229294121>')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('unban:cancel')
                    .setLabel('取消')
                    .setEmoji('<:xmark_988409378161954866:1201844342029815848>')
                    .setStyle(ButtonStyle.Secondary)
            )

            await interaction.update({
                embeds: [confirmationEmbed],
                components: [buttons]
            })
        }
    }
}
