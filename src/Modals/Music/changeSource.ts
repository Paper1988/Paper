import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { cacheSetJsonWithTTL } from '@/libs/utils/redis.js'
import { validateDJRole } from '@/Systems/Music.js'
import emojis from '@/libs/emoji/emoji.js'
import type { ModalType } from '@/typings/component.js'
import {
    ActionRowBuilder,
    EmbedBuilder,
    MessageFlags,
    ModalSubmitInteraction,
    StringSelectMenuBuilder
} from 'discord.js'
import type { Track } from 'moonlink.js'
import { randomUUID } from 'node:crypto'

const CANDIDATE_LIMIT = 10
const CACHE_TTL_SECONDS = 120

interface CachedCandidate {
    encoded: string
    title: string
    author: string
    duration: number
}

interface CachedSourceChoices {
    guildId: string
    userId: string
    currentIdentifier: string
    currentUri: string | null
    candidates: CachedCandidate[]
}

function formatDuration(ms: number): string {
    const seconds = Math.floor((ms / 1000) % 60)
    const minutes = Math.floor((ms / (1000 * 60)) % 60)
    const hours = Math.floor(ms / (1000 * 60 * 60))
    return hours > 0
        ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        : `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export default {
    id: 'changeSource',
    async execute(interaction: ModalSubmitInteraction, client: PaperClient) {
        if (!(await validateDJRole(interaction, client))) return
        const guild = interaction.guild
        if (!guild || !client.moonlink) {
            return interaction.reply({
                content: `${emojis.outage} | 無法使用音樂播放器。`,
                flags: MessageFlags.Ephemeral
            })
        }

        const player = client.moonlink.players.get(guild.id)
        const currentTrack = player?.current
        if (!player || !currentTrack) {
            return interaction.reply({
                content: `${emojis.warning} | 目前沒有正在播放的音樂!`,
                flags: MessageFlags.Ephemeral
            })
        }

        const member = await guild.members.fetch(interaction.user.id).catch(() => null)
        if (!member || member.voice.channelId !== player.voiceChannelId) {
            return interaction.reply({
                content: `${emojis.warning} | 請先加入 Paper 所在的語音頻道。`,
                flags: MessageFlags.Ephemeral
            })
        }

        const query = interaction.fields.getTextInputValue('query').trim()
        if (!query || /^https?:\/\//i.test(query)) {
            return interaction.reply({
                content: `${emojis.warning} | 請輸入歌曲名稱或演唱者，不要貼上網址。`,
                flags: MessageFlags.Ephemeral
            })
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral })
        try {
            const result = await client.moonlink.search({
                query: `ytsearch:${query}`,
                requester: interaction.user.id
            })
            if (result.isError || result.loadType === 'error') {
                throw new Error(result.exception?.message ?? 'YouTube search failed')
            }

            const seen = new Set<string>()
            const candidates = result.tracks
                .filter((track: Track) => {
                    if (track.sourceName !== 'youtube' || !track.encoded) return false
                    if (track.identifier === currentTrack.identifier || seen.has(track.identifier)) return false
                    seen.add(track.identifier)
                    return true
                })
                .slice(0, CANDIDATE_LIMIT)
                .map((track: Track) => ({
                    encoded: track.encoded,
                    title: track.title,
                    author: track.author || '未知作者',
                    duration: track.duration || 0
                }))

            if (candidates.length === 0) {
                return interaction.editReply({
                    content: `${emojis.warning} | 找不到其他可用的 YouTube 版本，試試更精確的歌名或演唱者。`
                })
            }

            const token = randomUUID().replace(/-/g, '').slice(0, 16)
            const cacheValue: CachedSourceChoices = {
                guildId: guild.id,
                userId: interaction.user.id,
                currentIdentifier: currentTrack.identifier,
                currentUri: currentTrack.uri,
                candidates
            }
            await cacheSetJsonWithTTL(
                `music:source:${interaction.user.id}:${token}`,
                cacheValue,
                CACHE_TTL_SECONDS
            )

            const select = new StringSelectMenuBuilder()
                .setCustomId(`changeSource:${token}`)
                .setPlaceholder('選擇要播放的版本')
                .addOptions(
                    candidates.map((candidate, index) => ({
                        label: candidate.title.slice(0, 100),
                        description: `${candidate.author} · ${formatDuration(candidate.duration)}`.slice(0, 100),
                        value: String(index)
                    }))
                )

            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle('找到可用版本')
                .setDescription(
                    `目前歌曲：**${currentTrack.title}**\n請選擇想要替換的版本。選擇後會保留原本的佇列。`
                )

            return interaction.editReply({
                embeds: [embed],
                components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select)]
            })
        } catch (error) {
            console.error('[Music Change Source] Search failed:', error)
            return interaction.editReply({
                content: `${emojis.outage} | 搜尋歌曲版本時發生錯誤，請稍後再試。`
            })
        }
    }
} satisfies ModalType
