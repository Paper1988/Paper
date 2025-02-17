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
        .setNameLocalization('zh-TW', '禁言')
        .setNameLocalization('ja', 'タイムアウト')
        .setDescription('Timeout a member')
        .setDescriptionLocalization('zh-TW', '禁言一位成員')
        .setDescriptionLocalization('ja', 'メンバーをタイムアウトする')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption((options) =>
            options
                .setName('user')
                .setNameLocalization('zh-TW', '用戶')
                .setNameLocalization('ja', 'ユーザー')
                .setDescription('Select target member')
                .setDescriptionLocalization('zh-TW', '選擇目標成員')
                .setDescriptionLocalization('ja', '対象メンバーを選択')
                .setRequired(true)
        )
        .addStringOption((options) =>
            options
                .setName('duration')
                .setNameLocalization('zh-TW', '時間')
                .setNameLocalization('ja', '期間')
                .setDescription('Provide duration (d h m s)')
                .setDescriptionLocalization('zh-TW', '請提供時間(d h m s)')
                .setDescriptionLocalization('ja', '期間を入力 (d h m s)')
                .setRequired(true)
        )
        .addStringOption((options) =>
            options
                .setName('reason')
                .setNameLocalization('zh-TW', '原因')
                .setNameLocalization('ja', '理由')
                .setDescription('Provide reason')
                .setDescriptionLocalization('zh-TW', '請提供理由')
                .setDescriptionLocalization('ja', '理由を入力')
                .setMaxLength(512)
        ),
    usage: '/timeout (user, duration, reason)',
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true })
        const { options, member } = interaction

        const user = options.getMember('user')
        const duration = options.getString('duration')
        const reason = options.getString('reason') || '無指定'

        const errorsArray = []

        const errorsEmbed = new EmbedBuilder()
            .setTitle('<:warning:1265562532857380936> | 無法禁言該成員，因為')
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
            .setTitle('<:timeout:1265562396412608623>')
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
