import type { CommandType } from '@/typings/command.js'
import { sendModeratorLog } from '@/Systems/ModeratorLog.js'
import {
    ChannelType,
    ChatInputCommandInteraction,
    GuildMember,
    MessageFlags,
    PermissionFlagsBits,
    SlashCommandBuilder,
    VoiceChannel
} from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('voice-move')
        .setNameLocalization('zh-TW', '語音移動')
        .setNameLocalization('ja', 'ボイス移動')
        .setDescription('Move a user from the current voice channel to another voice channel')
        .setDescriptionLocalization('zh-TW', '將用戶從目前語音頻道移動到另一個語音頻道')
        .setDescriptionLocalization(
            'ja',
            'ユーザーを現在のボイスチャンネルから別のボイスチャンネルに移動します'
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
        .addChannelOption((option) =>
            option
                .setName('move-to')
                .setNameLocalization('zh-TW', '移動到')
                .setNameLocalization('ja', '移動先')
                .setDescription('Please select a channel')
                .setDescriptionLocalization('zh-TW', '請選擇頻道')
                .setDescriptionLocalization('ja', 'チャンネルを選択してください')
                .addChannelTypes(ChannelType.GuildVoice)
                .setRequired(true)
        )
        .addUserOption((option) =>
            option
                .setName('target')
                .setNameLocalization('zh-TW', '用戶')
                .setNameLocalization('ja', 'ユーザー')
                .setDescription('Please select a member')
                .setDescriptionLocalization('zh-TW', '請選擇一名成員')
                .setDescriptionLocalization('ja', 'メンバーを選択してください')
                .setRequired(false)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const guild = interaction.guild
        if (!guild) {
            return interaction.reply({
                content: '<:warning:1265562532857380936> | 此指令只能在伺服器中使用。',
                flags: MessageFlags.Ephemeral
            })
        }

        const { options } = interaction
        const member = await guild.members.fetch(interaction.user.id)
        const newChannel = options.getChannel('move-to', true) as VoiceChannel
        const targetUser = options.getUser('target')
        const voiceChannel = member.voice.channel

        if (!voiceChannel) {
            return interaction.reply({
                content: '<:warning:1265562532857380936> | 您需要在語音頻道中才能移動成員!',
                flags: MessageFlags.Ephemeral
            })
        }
        if (newChannel.id === voiceChannel.id) {
            return interaction.reply({
                content: '<:warning:1265562532857380936> | 您不能將成員移動到同一個頻道!',
                flags: MessageFlags.Ephemeral
            })
        }

        if (targetUser) {
            const target = await guild.members.fetch(targetUser.id).catch(() => null)
            if (!target) {
                return interaction.reply({
                    content: '<:warning:1265562532857380936> | 找不到該伺服器成員。',
                    flags: MessageFlags.Ephemeral
                })
            }
            if (target.voice.channelId !== voiceChannel.id) {
                return interaction.reply({
                    content: '<:warning:1265562532857380936> | 該成員不在您的語音頻道中!',
                    flags: MessageFlags.Ephemeral
                })
            }

            await target.voice.setChannel(newChannel, `由 ${member.user.tag} 移動`)
            await sendModeratorLog(interaction, {
                action: '移動語音成員',
                target: `${target.user.tag} (${target.id})`,
                details: [`來源：<#${voiceChannel.id}>`, `目的地：<#${newChannel.id}>`]
            })
            return interaction.reply({
                content: `<:moveaudience:1265561080386555978> | 成功將成員 ${target} 移動到 ${newChannel}`,
                flags: MessageFlags.Ephemeral
            })
        }

        const movedMembers = [...voiceChannel.members.values()]
        await Promise.all(movedMembers.map((m) =>
            m.voice.setChannel(newChannel, `由 ${member.user.tag} 移動`)
        ))
        await sendModeratorLog(interaction, {
            action: '批次移動語音成員',
            details: [
                `來源：<#${voiceChannel.id}>`,
                `目的地：<#${newChannel.id}>`,
                `人數：${movedMembers.length}`
            ]
        })
        return interaction.reply({
            content: `<:moveaudience:1265561080386555978> | 成功將所有成員移動到 ${newChannel}`,
            flags: MessageFlags.Ephemeral
        })
    }
} as CommandType
