import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { cacheGetJson } from '@/libs/utils/redis.js'
import { validateDJRole } from '@/Systems/Music.js'
import emojis from '@/libs/emoji/emoji.js'
import type { MenuType } from '@/typings/component.js'
import { MessageFlags, type StringSelectMenuInteraction } from 'discord.js'
import type { Player } from 'moonlink.js'

interface CachedSourceChoices {
    guildId: string
    userId: string
    currentIdentifier: string
    currentUri: string | null
    candidates: Array<{ encoded: string; title: string; author: string; duration: number }>
}

export default {
    id: 'changeSource',
    async execute(rawInteraction, client: PaperClient, token?: string) {
        const interaction = rawInteraction as StringSelectMenuInteraction
        if (!(await validateDJRole(interaction, client))) return
        const guild = interaction.guild
        if (!guild || !client.moonlink || !token) {
            return interaction.reply({
                content: `${emojis.warning} | 這個版本選單已失效，請重新操作。`,
                flags: MessageFlags.Ephemeral
            })
        }

        const cached = await cacheGetJson<CachedSourceChoices>(
            `music:source:${interaction.user.id}:${token}`
        ).catch(() => null)
        if (!cached || cached.guildId !== guild.id || cached.userId !== interaction.user.id) {
            return interaction.reply({
                content: `${emojis.warning} | 搜尋結果已過期，請重新搜尋版本。`,
                flags: MessageFlags.Ephemeral
            })
        }

        const player = client.moonlink.players.get(guild.id) as Player | undefined
        const currentTrack = player?.current
        if (
            !player ||
            !currentTrack ||
            currentTrack.identifier !== cached.currentIdentifier ||
            currentTrack.uri !== cached.currentUri
        ) {
            return interaction.reply({
                content: `${emojis.warning} | 目前播放的歌曲已經改變，請重新搜尋版本。`,
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

        const selectedIndex = Number(interaction.values[0])
        if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= cached.candidates.length) {
            return interaction.reply({
                content: `${emojis.warning} | 無效的歌曲版本，請重新搜尋。`,
                flags: MessageFlags.Ephemeral
            })
        }

        const selected = cached.candidates[selectedIndex]
        if (!selected?.encoded) {
            return interaction.reply({
                content: `${emojis.warning} | 找不到這個歌曲版本，請重新搜尋。`,
                flags: MessageFlags.Ephemeral
            })
        }

        await interaction.deferUpdate()
        try {
            const track = client.moonlink.decodeTrack(selected.encoded)
            track.setRequester(interaction.user.id)
            await player.play({ track, noReplace: false })
            await interaction.editReply({
                content: `${emojis.correct} | 已切換版本：**${selected.title}** · ${selected.author}`,
                embeds: [],
                components: []
            })
        } catch (error) {
            console.error('[Music Change Source] Playback replacement failed:', error)
            await interaction.editReply({
                content: `${emojis.outage} | 更換版本失敗，請稍後再試。`,
                embeds: [],
                components: []
            })
        }
    }
} satisfies MenuType
