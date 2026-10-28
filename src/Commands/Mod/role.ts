import emojis from '@/libs/emoji/emoji.js'
import { sendModeratorLog } from '@/Systems/ModeratorLog.js'
import type { CommandType } from '@/typings/command.js'
import {
    ChatInputCommandInteraction,
    ContainerBuilder,
    GuildMember,
    MessageFlags,
    PermissionFlagsBits,
    Role,
    SlashCommandBuilder,
    TextDisplayBuilder
} from 'discord.js'

const buildResult = (message: string, color = 0xA3A3A3) =>
    new ContainerBuilder()
        .setAccentColor(color)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(message))

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

        const guild = interaction.guild
        if (!guild) {
            return interaction.editReply({
                components: [buildResult(`${emojis.warning} | 此指令只能在伺服器中使用。`)],
                flags: MessageFlags.IsComponentsV2
            })
        }

        const role = interaction.options.getRole('role', true) as Role
        const targetUser = interaction.options.getUser('user') ?? interaction.user

        try {
            const [target, actor] = await Promise.all([
                guild.members.fetch(targetUser.id),
                guild.members.fetch(interaction.user.id)
            ])

            if (!role.editable || role.position === 0) {
                return interaction.editReply({
                    components: [
                        buildResult(
                            `${emojis.warning} | 我無法編輯身分組：**${role.name}**`,
                            0xED4245
                        )
                    ],
                    flags: MessageFlags.IsComponentsV2
                })
            }

            if (
                interaction.user.id !== guild.ownerId &&
                role.position >= actor.roles.highest.position
            ) {
                return interaction.editReply({
                    components: [
                        buildResult(
                            `${emojis.warning} | 你無法管理與自己最高身分組同級或更高的身分組。`,
                            0xED4245
                        )
                    ],
                    flags: MessageFlags.IsComponentsV2
                })
            }

            if (
                target.id !== actor.id &&
                interaction.user.id !== guild.ownerId &&
                target.roles.highest.position >= actor.roles.highest.position
            ) {
                return interaction.editReply({
                    components: [
                        buildResult(
                            `${emojis.warning} | 你無法管理最高身分組與自己同級或更高的成員。`,
                            0xED4245
                        )
                    ],
                    flags: MessageFlags.IsComponentsV2
                })
            }

            const hasRole = target.roles.cache.has(role.id)
            if (hasRole) {
                await target.roles.remove(role)
            } else {
                await target.roles.add(role)
            }

            await sendModeratorLog(interaction, {
                action: hasRole ? '移除身分組' : '指派身分組',
                target: `${target.user.tag} (${target.id})`,
                details: [`身分組：${role.name} (${role.id})`]
            })

            return interaction.editReply({
                components: [
                    buildResult(
                        hasRole
                            ? `${emojis.correct} | 已從 ${target} 移除身分組 **${role.name}**。`
                            : `${emojis.correct} | 已將身分組 **${role.name}** 指派給 ${target}。`,
                        role.color || 0xA3A3A3
                    )
                ],
                flags: MessageFlags.IsComponentsV2
            })
        } catch (error) {
            console.error('[Role Command] Failed to update role:', error)
            return interaction.editReply({
                components: [
                    buildResult(
                        `${emojis.outage} | 身分組操作失敗，請確認機器人具有「管理身分組」權限，且機器人的最高身分組高於目標身分組。`,
                        0xED4245
                    )
                ],
                flags: MessageFlags.IsComponentsV2
            })
        }
    }
} as CommandType
