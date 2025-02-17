const {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
    PermissionFlagsBits
} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role-editor')
        .setDescription('Manage user roles')
        .setDescriptionLocalization('zh-TW', '管理用戶身分組')
        .setDescriptionLocalization('ja', 'ユーザーの役割を管理')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addRoleOption((option) =>
            option
                .setName('role')
                .setNameLocalization('zh-TW', '身分組')
                .setNameLocalization('ja', '役割')
                .setDescription('Please provide the role to add or remove')
                .setDescriptionLocalization('zh-TW', '請提供要添加或刪除的身分組')
                .setDescriptionLocalization('ja', '追加または削除する役割を提供してください')
                .setRequired(true)
        )
        .addUserOption((option) =>
            option
                .setName('user')
                .setNameLocalization('zh-TW', '用戶')
                .setNameLocalization('ja', 'ユーザー')
                .setDescription('Please provide the user to manage')
                .setDescriptionLocalization('zh-TW', '請提供要管理的用戶')
                .setDescriptionLocalization('ja', '管理するユーザーを提供してください')
                .setRequired(false)
        ),
    usage: '/role (role, user)',
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true })
        const { options } = interaction
        const role = options.getRole('role')
        const target = options.getMember('target') || interaction.member

        const embed = new EmbedBuilder()
            .setColor(`#${interaction.guild.roles.cache.get(role.id).color.toString(16)}`)
            .setTitle('🎭 身分組管理 🎭')

        if (!role.editable || role.position === 0) {
            embed.setDescription(`<:warning:1265562532857380936> | 我無法編輯身分組: **${role}** !`)
            return await interaction.editReply({ embeds: [embed], ephemeral: true })
        }

        embed.setDescription(
            target.roles.cache.has(role.id)
                ? `<:correct:1265560254708711467> | 成功從 ${target} 身上移除 **${role}**`
                : `<:correct:1265560254708711467> | 成功添加身分組: **${role}** 至 ${target} 身上`
        )
        target.roles.cache.has(role.id) ? target.roles.remove(role) : target.roles.add(role)
        const message = await interaction.editReply({
            embeds: [embed]
        })
        setTimeout(() => message.delete().catch(() => {}), 5000)
    }
}
