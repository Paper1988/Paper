const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ChatInputCommandInteraction,
    Client,
    ButtonStyle,
    ButtonBuilder
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
        var member

        const fetchBan = await guild.bans.fetch({ limit: 25 })

        const noBanEmbed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(`<:warning:1265562532857380936> | 伺服器中沒有正被封鎖的用戶!`)
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

        await interaction
            .reply({
                embeds: [choicesEmbed],
                components: [selectMenu]
            })
            .then((msg) => {
                const collector = msg.createMessageComponentCollector()

                collector.on('collect', async (i) => {
                    if (i.isStringSelectMenu() && i.customId == 'unban:selectMenu') {
                        member = await client.users.fetch(i.values[0])
                        const confirmationEmbed = new EmbedBuilder()
                            .setColor('Blue')
                            .setDescription(
                                `<:question:1265561586693701703> | 你確定要解除封鎖 ${member.username} 嗎?`
                            )
                            .setFooter({
                                text: client.user.username,
                                iconURL: client.user.displayAvatarURL()
                            })

                        const buttons = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId(`unban:confirm`)
                                .setLabel('確認')
                                .setEmoji('<:correct:1265560254708711467>')
                                .setStyle(ButtonStyle.Danger),
                            new ButtonBuilder()
                                .setCustomId('unban:cancel')
                                .setLabel('取消')
                                .setEmoji('<:xmark:1265562550947545089>')
                                .setStyle(ButtonStyle.Secondary)
                        )

                        await i.update({
                            embeds: [confirmationEmbed],
                            components: [buttons]
                        })
                    } else if (i.isButton() && i.customId == 'unban:confirm') {
                        const processEmbed = new EmbedBuilder()
                            .setColor('Blue')
                            .setDescription(
                                `<a:discord1792loading:1212016238839070791> | 正在執行中...`
                            )
                            .setFooter({
                                text: client.user.username,
                                iconURL: client.user.displayAvatarURL()
                            })

                        await i.update({
                            embeds: [processEmbed],
                            components: []
                        })

                        await guild.members.unban(member.id, `由 ${i.user.username} 操作`)

                        const finishedEmbed = new EmbedBuilder()
                            .setColor('Blue')
                            .setAuthor({
                                name: member.user.username,
                                iconURL: member.user.displayAvatarURL()
                            })
                            .setDescription(`${member.username} 已被解除封鎖!`)

                        await msg.edit({
                            embeds: [finishedEmbed],
                            components: []
                        })
                    } else if (i.isButton() && i.customId == 'unban:cancel') {
                        const canceledEmbed = new EmbedBuilder()
                            .setColor('Blue')
                            .setDescription(`<:outage:1265561329528471613> | 動作已取消`)

                        await i.update({
                            embeds: [canceledEmbed],
                            components: []
                        })
                    }
                })
            })
    }
}
