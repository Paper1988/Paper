import type { CommandType } from '@/typings/command.js'
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
        const { options } = interaction
        const member = interaction.member! as GuildMember
        const newChannel = options.getChannel('move-to') as VoiceChannel
        const voiceChannel = member.voice.channel!
        const target = options.getMember('target')! as GuildMember

        if (!voiceChannel) {
            return await interaction.reply({
                content: '<:warning:1265562532857380936> | 您需要在語音頻道中才能移動成員!',
                flags: MessageFlags.Ephemeral
            })
        }
        if (newChannel === voiceChannel) {
            return await interaction.reply({
                content: '<:warning:1265562532857380936> | 您不能將成員移動到同一個頻道!',
                flags: MessageFlags.Ephemeral
            })
        }

        if (!target) {
            voiceChannel.members.forEach((m) => {
                m.voice.setChannel(newChannel, `由 ${member.user.tag} 移動`)
            })
            return await interaction.reply({
                content: `<:moveaudience:1265561080386555978> | 成功將所有成員移動到 ${newChannel}`,
                flags: MessageFlags.Ephemeral
            })
        } else {
            const members = voiceChannel.members.map((m) => m.id)
            if (members.includes(target.id)) {
                await target.voice.setChannel(newChannel, `由 ${member.user.tag} 移動`)
                return await interaction.reply({
                    content: `<:moveaudience:1265561080386555978> | 成功將成員 ${target} 移動到 ${newChannel}`,
                    flags: MessageFlags.Ephemeral
                })
            } else {
                await interaction.reply({
                    content: '<:warning:1265562532857380936> | 該成員不在語音頻道中!',
                    flags: MessageFlags.Ephemeral
                })
            }
        }
    }
} as CommandType
