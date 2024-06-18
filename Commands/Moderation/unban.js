const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    StringSelectMenuBuilder
} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('解除封鎖伺服器中被封鎖的成員')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false),
    async execute(interaction, client) {
        const { guild } = interaction

        const fetchBan = await guild.bans.fetch({ limit: 25 })

        const noBanEmbed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(
                `<:warning_908958943466893323:1201844340276862976> | 伺服器中沒有正被封鎖的用戶!`
            )
            .setFooter({
                text: client.user.username,
                iconURL: client.user.displayAvatarURL()
            })

        if (fetchBan.size === 0)
            return interaction.reply({
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
                iconURL: client.user.displayAvatarURL({ dynamic: true })
            })

        const selectMenu = new ActionRowBuilder().addComponents([
            new StringSelectMenuBuilder()
                .setCustomId('unban:selectMenu')
                .setPlaceholder('選擇一個用戶')
                .addOptions(memberList)
                .setMinValues(1)
                .setMaxValues(1)
        ])

        await interaction
            .reply({
                embeds: [choicesEmbed],
                components: [selectMenu],
                ephemeral: true
            })
            .then(async (msg) => {
                const collector = msg.createMessageComponentCollector({
                    idle: 10 * 1000
                })

                collector.on('end', async () => {
                    const msgC = await interaction.fetchReply()
                    if (!msg) return
                    if (!msgC.components.length) return

                    const noInteractionEmbed = new EmbedBuilder()
                        .setColor('Orange')
                        .setDescription(`10秒內未收到任何回應，動作已取消!`)
                        .setFooter({
                            text: '你可以關閉這個視窗了'
                        })

                    await msg.edit({
                        embeds: [noInteractionEmbed],
                        components: []
                    })
                })

                module.exports = { msg }
            })
    }
}
