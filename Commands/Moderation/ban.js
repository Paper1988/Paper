const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChatInputCommandInteraction,
    EmbedBuilder
} = require('discord.js')
const ms = require('ms')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('封鎖一名成員')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false)
        .addUserOption((options) =>
            options.setName('user').setDescription('選擇一個成員').setRequired(true)
        )
        .addStringOption((options) =>
            options
                .setName('reason')
                .setDescription('請提供理由')
                .setMaxLength(512)
                .setRequired(true)
        ),
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        await interaction.deferReply({ fetchReply: true })
        const { options, guild, member } = interaction

        const target = options.getMember('user')
        const reason = options.getString('reason')

        const errorsArray = []

        const dmEmbed = new EmbedBuilder()
            .setColor('Green')
            .setDescription(
                [
                    `你已被伺服器 ${guild.name} **封鎖**`,
                    `操作者: ${member}`,
                    `\n原因: ${reason}`
                ].join('\n')
            )
            .setImage(`${member.displayAvatarURL()}`)
            .setFooter({
                iconURL: guild.iconURL(),
                text: `${guild.name}`
            })

        const errorsEmbed = new EmbedBuilder()
            .setTitle('<:warning:1265562532857380936> | 無法封鎖該名成員，因為')
            .setColor('Red')

        if (!target)
            return await interaction.editReply({
                embeds: [errorsEmbed.setDescription('所選成員很可能已經離開伺服器了')],
                ephemeral: true
            })

        if (!target.bannable) errorsArray.push('我的權限不夠大!')

        if (member.roles.highest.position < target.roles.highest.position)
            errorsArray.push('所選成員的權限比你高!')

        if (errorsArray.length)
            return await interaction.editReply({
                embeds: [errorsEmbed.setDescription(errorsArray.join('\n'))],
                ephemeral: true
            })

        if (!target.user.bot) {
            await target.send({ embeds: [dmEmbed] })
        }
        await target.ban({ reason: reason }).catch((err) => {
            interaction.editReply({
                embeds: [errorsEmbed.setDescription('發生一個罕見的錯誤')]
            })
            return console.log('錯誤發生 - 在 Ban.js', err)
        })
        const successEmbed = new EmbedBuilder()
            .setAuthor({
                name: `${guild.name}`,
                iconURL: guild.iconURL()
            })
            .setColor('Green')
            .setDescription(`被封鎖的成員: ${target}\n操作的管理員: ${member}\n原因: ${reason}`)
        return await interaction.editReply({ embeds: [successEmbed] })
    }
}
