import emojis from '@/libs/emoji/emoji.js'
import TempVoice from '@/Structures/Schemas/TempVoice.js'
import TempVoiceChannel from '@/Structures/Schemas/TempVoiceChannel.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { buildPanel, clearRenameLog, transferOwnership } from '@/Systems/TempVoice.js'
import type { EventType } from '@/typings/event.js'
import { ChannelType, Events, PermissionFlagsBits, VoiceState } from 'discord.js'

const cooldown = new Map<string, number>()
const COOLDOWN_MS = 10_000

export default {
    name: Events.VoiceStateUpdate,
    async execute(client: PaperClient, oldState: VoiceState, newState: VoiceState) {
        if (!client || oldState.channelId === newState.channelId) return

        // ─── 離開頻道 ─────────────────────────────────────────────
        const oldChannel = oldState.channel
        if (oldChannel?.type === ChannelType.GuildVoice) {
            const record = await TempVoiceChannel.findOne({ ChannelID: oldChannel.id })
                .exec()
                .catch(() => null)

            if (record) {
                const humans = oldChannel.members.filter((m) => !m.user.bot)

                if (humans.size === 0) {
                    await record.deleteOne()
                    clearRenameLog(oldChannel.id)
                    await oldChannel.delete('臨時語音頻道已無成員').catch(() => {})
                } else if (record.OwnerID === oldState.id) {
                    const next = humans.first()!
                    await transferOwnership(oldChannel, record.OwnerID, next).catch(() => {})
                    await oldChannel.send(`👑 | 擁有者已離開，${next} 成為新的頻道擁有者`).catch(() => {})
                }
            }
        }

        // ─── 加入大廳 ─────────────────────────────────────────────
        const member = newState.member
        const lobby = newState.channel
        if (!member || !lobby) return

        const Data = await TempVoice.findOne({ GuildID: newState.guild.id })
            .exec()
            .catch(() => null)
        if (!Data || lobby.id !== Data.LobbyChannel) return

        const last = cooldown.get(member.id) ?? 0
        if (Date.now() - last < COOLDOWN_MS) {
            await member.voice.disconnect('建立臨時頻道過於頻繁').catch(() => {})
            return
        }
        cooldown.set(member.id, Date.now())
        setTimeout(() => cooldown.delete(member.id), COOLDOWN_MS)

        const parent = lobby.parentId
        const parentChannel = parent ? newState.guild.channels.cache.get(parent) : null
        const inherited =
            parentChannel && 'permissionOverwrites' in parentChannel
                ? [...parentChannel.permissionOverwrites.cache.values()]
                : []

        const channel = await newState.guild.channels
            .create({
                name: Data.NameTemplate.replace('{user}', member.displayName).slice(0, 100),
                type: ChannelType.GuildVoice,
                parent,
                bitrate: lobby.bitrate,
                userLimit: Data.UserLimit,
                permissionOverwrites: [
                    ...inherited,
                    {
                        id: member.id,
                        allow: [
                            PermissionFlagsBits.ManageChannels,
                            PermissionFlagsBits.MoveMembers,
                            PermissionFlagsBits.Connect
                        ]
                    }
                ],
                reason: `${member.user.tag} 建立臨時語音頻道`
            })
            .catch(() => null)
        if (!channel) return

        const record = await TempVoiceChannel.create({
            GuildID: newState.guild.id,
            ChannelID: channel.id,
            OwnerID: member.id
        })

        const moved = await member.voice
            .setChannel(channel)
            .then(() => true)
            .catch(() => false)

        if (!moved) {
            await record.deleteOne()
            await channel.delete().catch(() => {})
            return
        }

        const panel = await channel
            .send({ content: `${emojis.friend} | ${member} 歡迎來到你的頻道!`, ...buildPanel(channel, member.id) })
            .catch(() => null)

        if (panel) {
            record.PanelMessageID = panel.id
            await record.save()
        }
    }
} satisfies EventType
