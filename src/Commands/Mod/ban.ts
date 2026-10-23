import emojis from '@/libs/emoji/emoji.js'
import { sendModeratorLog } from '@/Systems/ModeratorLog.js'
import type { CommandType } from '@/typings/command.js'
import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    GuildMember,
    PermissionFlagsBits,
    SlashCommandBuilder,
    User
} from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setNameLocalization('zh-TW', '封禁')
        .setNameLocalization('ja', 'バン')
        .setDescription('Ban a member')
        .setDescriptionLocalization('zh-TW', '封禁一位成員')
        .setDescriptionLocalization('ja', 'メンバーをBANします')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption((options) =>
            options
                .setName('user')
                .setNameLocalization('zh-TW', '使用者')
                .setNameLocalization('ja', 'ユーザー')
                .setDescription('Please select a member')
                .setDescriptionLocalization('zh-TW', '請選擇一位成員')
                .setDescriptionLocalization('ja', 'メンバーを選択してください')
                .setRequired(true)
        )
        .addStringOption((options) =>
            options
                .setName('reason')
                .setNameLocalization('zh-TW', '理由')
                .setNameLocalization('ja', '理由')
                .setDescription('Please provide a reason')
                .setDescriptionLocalization('zh-TW', '請提供封禁理由')
                .setDescriptionLocalization('ja', 'BANの理由を入力してください')
                .setMaxLength(512)
                .setRequired(true)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply()
        const { options, guild } = interaction
        const member = interaction.member! as GuildMember

        const target = options.getMember('user')! as GuildMember
        const reason = options.getString('reason')!

        const errorsArray: string[] = []

        const dmEmbed = new EmbedBuilder()
            .setColor('Green')
            .setDescription(
                [
                    `你已被伺服器 ${guild!.name} **封鎖**`,
                    `操作者: ${member}`,
                    `\n原因: ${reason}`
                ].join('\n')
            )
            .setImage(`${(member!.user as User).displayAvatarURL()}`)
            .setFooter({
                iconURL: guild!.iconURL()!,
                text: `${guild!.name}`
            })

        const errorsEmbed = new EmbedBuilder()
            .setTitle(`${emojis.warning} | 無法封鎖該名成員，因為`)
            .setColor('Red')

        if (!target) {
            return await interaction.editReply({
                embeds: [errorsEmbed.setDescription('所選成員很可能已經離開伺服器了')]
            })
        }

        if (!target.bannable) errorsArray.push('我的權限不夠大!')

        if (member.roles.highest.position < target.roles.highest.position) {
            errorsArray.push('所選成員的權限比你高!')
        }

        if (errorsArray.length) {
            return await interaction.editReply({
                embeds: [errorsEmbed.setDescription(errorsArray.join('\n'))]
            })
        }

        if (!target.user.bot) {
            // A failed DM must not prevent the moderation action.
            await target.send({ embeds: [dmEmbed] }).catch(() => null)
        }

        try {
            await target.ban({ reason })
        } catch (error) {
            console.error('[Ban Command] Failed to ban member:', error)
            return interaction.editReply({
                embeds: [errorsEmbed.setDescription('封禁失敗，請確認 Paper 的權限與身分組階級。')]
            })
        }

        await sendModeratorLog(interaction, {
            action: '封禁成員',
            target: `${target.user.tag} (${target.id})`,
            reason
        })
        const successEmbed = new EmbedBuilder()
            .setAuthor({
                name: `${guild!.name}`,
                iconURL: guild!.iconURL()!
            })
            .setColor('Green')
            .setDescription(`被封鎖的成員: ${target}\n操作的管理員: ${member}\n原因: ${reason}`)

        await interaction.editReply({ embeds: [successEmbed] })
    }
} as CommandType
