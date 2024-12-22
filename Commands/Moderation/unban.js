const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ChatInputCommandInteraction,
    Client
} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('解除封鎖伺服器中被封鎖的成員')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     * @returns
     */
    async execute(interaction, client) {
        const { guild } = interaction

        const fetchBan = await guild.bans.fetch({ limit: 25 })

        const noBanEmbed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(
                `<:warning:1265562532857380936> | 伺服器中沒有正被封鎖的用戶!`
            )
            .setFooter({
                text: client.user.username,
                iconURL: client.user.displayAvatarURL()
            })

        if (fetchBan.size === 0)
            return await interaction.reply({
                embeds: [noBanEmbed],
                ephemeral: true
            })

        const memberList = []
        fetchBan.forEach((member) => {
            memberList.push({ label: member.user.username, value: member.user.id })
        })

        const choicesEmbed = new EmbedBuilder()
            .setColor('Blue')
            .setDescription('從下面的列表中選取一位用戶')
            .setFooter({
                text: client.user.username,
                iconURL: client.user.displayAvatarURL()
            })

        const selectMenu = new ActionRowBuilder().addComponents([
            new StringSelectMenuBuilder()
                .setCustomId('unban:selectMenu')
                .setPlaceholder('選擇一個用戶')
                .addOptions(memberList)
                .setMinValues(1)
                .setMaxValues(1)
        ])

        await interaction.reply({
            embeds: [choicesEmbed],
            components: [selectMenu],
            ephemeral: true
        })
    }
}
