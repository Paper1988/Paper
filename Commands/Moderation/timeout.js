const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChatInputCommandInteraction,
    EmbedBuilder
} = require('discord.js')
const ms = require('ms')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('禁言一位成員')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false)
        .addUserOption((options) =>
            options.setName('user').setDescription('選擇目標成員').setRequired(true)
        )
        .addStringOption((options) =>
            options.setName('duration').setDescription('請提供時間(d h m s)').setRequired(true)
        )
        .addStringOption((options) =>
            options.setName('reason').setDescription('請提供理由').setMaxLength(512)
        ),
    usage: '/timeout (user, duration, reason)',
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        await interaction.deferReply({ fetchReply: true, ephemeral: true })
        const { options, member } = interaction

        const user = options.getMember('user')
        const duration = options.getString('duration')
        const reason = options.getString('reason') || '無指定'

        const errorsArray = []

        const errorsEmbed = new EmbedBuilder()
            .setTitle('<:warning_908958943466893323:1201844340276862976> | 無法禁言該成員，因為')
            .setColor('Red')

        if (!user)
            return await interaction.reply({
                embeds: [errorsEmbed.setDescription('該名成員很可能已經離開伺服器了')],
                ephemeral: true
            })

        if (!ms(duration) || ms(duration) > ms('28d'))
            errorsArray.push('所提供的時間無效或者超過28天的限制!')

        if (!user.manageable || !user.moderatable)
            errorsArray.push('所選的目標成員無法由機器人管理(我的權限不夠大!)')

        if (member.roles.highest.position < user.roles.highest.position)
            errorsArray.push('所選的目標成員權限比你高!')

        if (errorsArray.length)
            return interaction.reply({
                embeds: [errorsEmbed.setDescription(errorsArray.join('\n'))],
                ephemeral: true
            })

        await user.timeout(ms(duration), reason).catch(async () => {
            return await interaction.reply({
                embeds: [errorsEmbed.setDescription('一個不常見的錯誤： `時間不能小於0`!')],
                ephemeral: true
            })
        })

        const successEmbed = new EmbedBuilder()
            .setTitle('<:timeout_930797536900415548:1201844326322151454>')
            .setColor('Green')
            .setDescription(
                [
                    `被禁言用戶: ${user}`,
                    `執行者: ${member}`,
                    `時間: **${ms(ms(duration), {
                        long: true
                    })}**`,
                    `\n原因: ${reason}`
                ].join('\n')
            )

        return await interaction.reply({ embeds: [successEmbed] })
    }
}
