import emojis from '@/libs/emoji/emoji.js'
import TempVoiceChannel from '@/Structures/Schemas/TempVoiceChannel.js'
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    EmbedBuilder,
    GuildMember,
    MessageFlags,
    PermissionFlagsBits,
    type ButtonInteraction,
    type ModalSubmitInteraction,
    type UserSelectMenuInteraction,
    type VoiceChannel
} from 'discord.js'

type PanelInteraction = ButtonInteraction | ModalSubmitInteraction | UserSelectMenuInteraction

// Discord 限制每個頻道 10 分鐘內只能改名 2 次
const RENAME_WINDOW_MS = 10 * 60_000
const renameLog = new Map<string, number[]>()

export function checkRenameLimit(channelId: string): number | null {
    const recent = (renameLog.get(channelId) ?? []).filter((t) => Date.now() - t < RENAME_WINDOW_MS)
    renameLog.set(channelId, recent)
    return recent.length >= 2 ? recent[0]! + RENAME_WINDOW_MS : null
}

export function recordRename(channelId: string) {
    renameLog.get(channelId)?.push(Date.now())
}

export function clearRenameLog(channelId: string) {
    renameLog.delete(channelId)
}

export function isLocked(channel: VoiceChannel) {
    return (
        channel.permissionOverwrites.cache
            .get(channel.guild.roles.everyone.id)
            ?.deny.has(PermissionFlagsBits.Connect) ?? false
    )
}

export function buildPanel(channel: VoiceChannel, ownerId: string, locked = isLocked(channel)) {
    const embed = new EmbedBuilder()
        .setTitle('臨時語音頻道控制面板')
        .setDescription(
            [
                `> 擁有者: <@${ownerId}>`,
                `> 狀態: ${locked ? '🔒 已上鎖' : '🔓 開放'}`,
                `> 人數上限: ${channel.userLimit || '無限制'}`
            ].join('\n')
        )
        .setColor('White')

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId('tvRename').setLabel('改名').setEmoji('✏️').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('tvLimit').setLabel('人數上限').setEmoji('👥').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('tvLock')
            .setLabel(locked ? '解鎖' : '上鎖')
            .setEmoji(locked ? '🔓' : '🔒')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('tvKick').setLabel('踢出').setEmoji('👢').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('tvTransfer').setLabel('轉移').setEmoji('👑').setStyle(ButtonStyle.Primary)
    )

    return { embeds: [embed], components: [row] }
}

/**
 * 確認互動來自臨時語音頻道，且使用者是擁有者或有「管理頻道」權限
 */
export async function getManagedChannel(interaction: PanelInteraction) {
    const channel = interaction.channel
    const record =
        channel?.type === ChannelType.GuildVoice
            ? await TempVoiceChannel.findOne({ ChannelID: channel.id }).exec().catch(() => null)
            : null

    if (!channel || channel.type !== ChannelType.GuildVoice || !record) {
        await interaction.reply({
            content: `${emojis.warning} | 這個頻道已經不是臨時語音頻道了!`,
            flags: MessageFlags.Ephemeral
        })
        return null
    }

    const member = interaction.member as GuildMember
    if (record.OwnerID !== member.id && !member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        await interaction.reply({
            content: `${emojis.warning} | 只有頻道擁有者可以使用這個面板!`,
            flags: MessageFlags.Ephemeral
        })
        return null
    }

    return { channel, record }
}

export async function refreshPanel(channel: VoiceChannel, ownerId: string, panelMessageId?: string | null) {
    if (!panelMessageId) return
    const message = await channel.messages.fetch(panelMessageId).catch(() => null)
    await message?.edit(buildPanel(channel, ownerId)).catch(() => {})
}

export async function transferOwnership(channel: VoiceChannel, oldOwnerId: string, newOwner: GuildMember) {
    await channel.permissionOverwrites.delete(oldOwnerId).catch(() => {})
    await channel.permissionOverwrites.edit(newOwner.id, {
        ManageChannels: true,
        MoveMembers: true,
        Connect: true
    })

    const record = await TempVoiceChannel.findOneAndUpdate(
        { ChannelID: channel.id },
        { OwnerID: newOwner.id },
        { returnDocument: 'after' }
    ).exec()

    await refreshPanel(channel, newOwner.id, record?.PanelMessageID)
}
