const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ChatInputCommandInteraction,
    Client,
    ButtonStyle
} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('解除封鎖伺服器中被封鎖的成員')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false),
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     * @returns
     */
    async execute(interaction, client) {
        const { guild } = interaction
        let member

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
                components: [selectMenu],
                ephemeral: true
            })
            .then((msg) => {
                const collector = msg.createMessageComponentCollector()

                collector.on('collect', async (i) => {
                    if (i.isStringSelectMenu() && i.customId == 'unban:selectMenu') {
                        member = guild.members.cache.get(i.values[0])
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
                                .setCustomId(`unban:confirm`)
                                .setLabel('確認')
                                .setEmoji('<:correct_859388130411282442:1201843648229294121>')
                                .setStyle(ButtonStyle.Danger),
                            new ButtonBuilder()
                                .setCustomId('unban:cancel')
                                .setLabel('取消')
                                .setEmoji('<:xmark_988409378161954866:1201844342029815848>')
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
                            .setDescription(`${member} 已被解除封鎖!`)

                        await msg.edit({
                            embeds: [finishedEmbed],
                            components: []
                        })
                    } else if (i.isButton() && i.customId == 'unban:cancel') {
                        const canceledEmbed = new EmbedBuilder()
                            .setColor('Blue')
                            .setDescription(
                                `<:outage_868122243845206087:1202112862990897172> | 動作已取消`
                            )

                        await i.update({
                            embeds: [canceledEmbed],
                            components: []
                        })
                    }
                })
            })
    }
}
