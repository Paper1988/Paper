const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChatInputCommandInteraction,
    EmbedBuilder
} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('將成員踢出伺服器')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setDMPermission(false)
        .addUserOption((options) =>
            options.setName('user').setDescription('選擇一名成員').setRequired(true)
        )
        .addStringOption((options) =>
            options.setName('reason').setDescription('請提供原因').setMaxLength(512)
        ),
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        await interaction.deferReply({ fetchReply: true })
        const { options, guild, member } = interaction

        const target = options.getMember('user')
        const reason = options.getString('reason') || '無指定'

        const errorsArray = []

        const dmEmbed = new EmbedBuilder()
            .setColor('Green')
            .setDescription(
                [
                    `你已被伺服器 ${guild.name} **踢出**`,
                    `操作者: ${member}`,
                    `\n原因: ${reason}`
                ].join('\n')
            )

        const errorsEmbed = new EmbedBuilder()
            .setAuthor({
                name: '<:warning:1265562532857380936> | 無法踢出該名成員，因為'
            })
            .setColor('Red')

        if (!target)
            return interaction.editReply({
                embeds: [errorsEmbed.setDescription('所選成員很可能已經離開伺服器了')],
                ephemeral: true
            })

        if (!target.kickable) errorsArray.push('我的權限不夠大!')

        if (member.roles.highest.position < target.roles.highest.position)
            errorsArray.push('所選成員的權限比你高!')

        if (errorsArray.length)
            return interaction.editReply({
                embeds: [errorsEmbed.setDescription(errorsArray.join('\n'))],
                ephemeral: true
            })

        try {
            await target.send({ embeds: [dmEmbed] })
        } catch {
            return
        }
        await target.kick({ reason: reason }).catch((err) => {
            interaction.editReply({
                embeds: [
                    errorsEmbed.setDescription(
                        '<:warning:1265562532857380936> | 發生一個不常見的錯誤，無法踢出成員'
                    )
                ]
            })
            return console.log('錯誤發生 - 在 kick.js\n', err)
        })

        const successEmbed = new EmbedBuilder()
            .setColor('Green')
            .setDescription(
                [`被踢出成員: ${target}`, `操作者: ${member}`, `\n原因: ${reason}`].join('\n')
            )

        return interaction.editReply({ embeds: [successEmbed] })
    }
}
