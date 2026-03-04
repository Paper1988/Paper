import emojis from '@/libs/emoji/emoji.js'
import { deleteMessageAfter } from '@/Systems/Music.js'
import type { CommandType } from '@/typings/command.js'
import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    GuildMember,
    MessageFlags,
    PermissionFlagsBits,
    Role,
    SlashCommandBuilder
} from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('role')
        .setNameLocalization('zh-TW', '身分組管理')
        .setNameLocalization('ja', '役割エディター')
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
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral })
        const { options } = interaction
        const role = options.getRole('role')! as Role
        const target =
            (options.getMember('target')! as GuildMember) || (interaction.member! as GuildMember)

        const embed = new EmbedBuilder()
            .setColor(
                `#${interaction.guild!.roles.cache.get(role.id)!.colors.primaryColor.toString(16)}`
            )
            .setTitle('🎭 身分組管理 🎭')

        if (!role.editable || role.position === 0) {
            embed.setDescription(`${emojis.warning} | 我無法編輯身分組: **${role}** !`)
            return await interaction.editReply({ embeds: [embed] }).then(deleteMessageAfter)
        }

        embed.setDescription(
            target.roles.cache.has(role.id)
                ? `${emojis.correct} | 成功從 ${target} 身上移除 **${role}**`
                : `${emojis.correct} | 成功添加身分組: **${role}** 至 ${target} 身上`
        )

        target.roles.cache.has(role.id)
            ? await target.roles.remove(role)
            : await target.roles.add(role)

        return interaction.editReply({ embeds: [embed] }).then(deleteMessageAfter)
    }
} as CommandType
