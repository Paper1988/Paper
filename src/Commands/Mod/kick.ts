import emojis from '@/libs/emoji/emoji.js'
import { sendModeratorLog } from '@/Systems/ModeratorLog.js'
import { deleteMessageAfter } from '@/Systems/Music.js'
import type { CommandType } from '@/typings/command.js'
import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    GuildMember,
    PermissionFlagsBits,
    SlashCommandBuilder
} from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setNameLocalization('zh-TW', '踢出')
        .setNameLocalization('ja', 'キック')
        .setDescription('Kick a member')
        .setDescriptionLocalization('zh-TW', '踢出伺服器中的成員')
        .setDescriptionLocalization('ja', 'メンバーをキックします')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption((options) =>
            options
                .setName('user')
                .setNameLocalization('zh-TW', '用戶')
                .setNameLocalization('ja', 'ユーザー')
                .setDescription('Please select a member')
                .setDescriptionLocalization('zh-TW', '請選擇一名成員')
                .setDescriptionLocalization('ja', 'メンバーを選択してください')
                .setRequired(true)
        )
        .addStringOption((options) =>
            options
                .setName('reason')
                .setNameLocalization('zh-TW', '原因')
                .setNameLocalization('ja', '理由')
                .setDescription('Please provide a reason')
                .setDescriptionLocalization('zh-TW', '請提供原因')
                .setDescriptionLocalization('ja', 'キックの理由を入力してください')
                .setMaxLength(512)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply()
        const { options } = interaction
        const guild = interaction.guild!
        const member = interaction.member! as GuildMember

        const target = options.getMember('user')! as GuildMember
        const reason = options.getString('reason') || '無指定'

        const errorsArray: string[] = []

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
                name: `${emojis.warning} | 無法踢出該名成員，因為`
            })
            .setColor('Red')

        if (!target) {
            return interaction
                .editReply({
                    embeds: [errorsEmbed.setDescription('所選成員很可能已經離開伺服器了')]
                })
                .then(deleteMessageAfter)
        }

        if (!target.kickable) errorsArray.push('我的權限不夠大!')

        if (
            interaction.guild?.ownerId !== interaction.user.id &&
            member.roles.highest.position <= target.roles.highest.position
        ) {
            errorsArray.push('所選成員的權限比你高!')
        }

        if (errorsArray.length) {
            return interaction
                .editReply({
                    embeds: [errorsEmbed.setDescription(errorsArray.join('\n'))]
                })
                .then(deleteMessageAfter)
        }

        // A failed DM must not prevent the moderation action.
        await target.send({ embeds: [dmEmbed] }).catch(() => null)

        try {
            await target.kick(reason)
        } catch (error) {
            console.error('[Kick Command] Failed to kick member:', error)
            return interaction
                .editReply({
                    embeds: [
                        errorsEmbed.setDescription(`${emojis.outage} | 踢出失敗，請確認 Paper 的權限與身分組階級。`)
                    ]
                })
                .then(deleteMessageAfter)
        }

        await sendModeratorLog(interaction, {
            action: '踢出成員',
            target: `${target.user.tag} (${target.id})`,
            reason
        })

        const successEmbed = new EmbedBuilder()
            .setColor('Green')
            .setDescription(
                [`被踢出成員: ${target}`, `操作者: ${member}`, `\n原因: ${reason}`].join('\n')
            )

        return interaction.editReply({ embeds: [successEmbed] })
    }
} as CommandType
