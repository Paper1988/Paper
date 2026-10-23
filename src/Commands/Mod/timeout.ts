import { deleteMessageAfter } from '@/Systems/Music.js'
import { sendModeratorLog } from '@/Systems/ModeratorLog.js'
import type { CommandType } from '@/typings/command.js'
import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    GuildMember,
    MessageFlags,
    PermissionFlagsBits,
    SlashCommandBuilder
} from 'discord.js'
import type { StringValue } from 'ms'
import ms from 'ms'

export default {
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
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral })
        const { options } = interaction
        const member = interaction.member! as GuildMember

        const user = options.getMember('user')! as GuildMember
        const duration = options.getString('duration')!
        const reason = options.getString('reason') || '無指定'

        const errorsArray: string[] = []

        const errorsEmbed = new EmbedBuilder()
            .setTitle('<:warning:1265562532857380936> | 無法禁言該成員，因為')
            .setColor('Red')

        if (!user) {
            return await interaction
                .editReply({
                    embeds: [errorsEmbed.setDescription('該名成員很可能已經離開伺服器了')]
                })
                .then(deleteMessageAfter)
        }

        const durationMs = ms(duration as StringValue)
        const maxDuration = ms('28d')
        if (!duration || !durationMs || durationMs > maxDuration) {
            errorsArray.push('所提供的時間無效或者超過28天的限制!')
        }

        if (!user.manageable || !user.moderatable) {
            errorsArray.push('所選的目標成員無法由機器人管理(我的權限不夠大!)')
        }

        if (member.roles.highest.position < user.roles.highest.position) {
            errorsArray.push('所選的目標成員權限比你高!')
        }

        if (errorsArray.length) {
            return interaction.editReply({
                embeds: [errorsEmbed.setDescription(errorsArray.join('\n'))]
            })
        }

        try {
            await user.timeout(durationMs, reason)
        } catch (error) {
            console.error('[Timeout Command] Failed to timeout member:', error)
            return interaction.editReply({
                embeds: [errorsEmbed.setDescription('禁言失敗，請確認 Paper 的權限與身分組階級。')]
            })
        }

        await sendModeratorLog(interaction, {
            action: '禁言成員',
            target: `${user.user.tag} (${user.id})`,
            reason,
            details: [`時長：${ms(durationMs, { long: true })}`]
        })

        const successEmbed = new EmbedBuilder()
            .setTitle('<:timeout:1265562396412608623>')
            .setColor('Green')
            .setDescription(
                [
                    `被禁言用戶: ${user}`,
                    `執行者: ${member}`,
                    `時間: **${durationMs ? ms(durationMs, { long: true }) : '無效時間'}**`,
                    `\n原因: ${reason}`
                ].join('\n')
            )

        await interaction.editReply({ embeds: [successEmbed] })
    }
} as CommandType
