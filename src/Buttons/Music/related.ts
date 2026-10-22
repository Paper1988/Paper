import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { deleteMessageAfter, updateMusicPlayerStatus, validateVoiceChannel } from '@/Systems/Music.js'
import emojis from '@/libs/emoji/emoji.js'
import type { ButtonType } from '@/typings/component.js'
import { ButtonInteraction, EmbedBuilder, GuildMember, MessageFlags } from 'discord.js'
import type { Player, Track } from 'moonlink.js'

const RECOMMENDATION_LIMIT = 5

export default {
    id: 'related',
    async execute(interaction: ButtonInteraction, client: PaperClient) {
        const member = interaction.member! as GuildMember
        const voiceChannel = member.voice.channel

        if (!(await validateVoiceChannel(interaction, client, voiceChannel))) return

        await interaction.deferReply({ flags: MessageFlags.Ephemeral })

        const player = client.moonlink?.players.get(interaction.guildId!) as Player | undefined
        const currentTrack = player?.current

        if (!player || !currentTrack) {
            return interaction.editReply({
                content: `${emojis.warning} | 目前沒有正在播放的音樂!`
            }).then(deleteMessageAfter)
        }

        try {
            const query = `similar to ${currentTrack.author || ''} ${currentTrack.title}`.trim()
            const result = await client.moonlink!.search({
                query,
                requester: interaction.user.id
            })

            if (result.isError || result.loadType === 'error') {
                throw new Error(result.exception?.message ?? 'Music search failed')
            }

            const queuedIdentifiers = new Set([
                currentTrack.identifier,
                ...player.queue.tracks.map((track: Track) => track.identifier)
            ])

            const recommendations = result.tracks
                .filter((track: Track) => !queuedIdentifiers.has(track.identifier))
                .slice(0, RECOMMENDATION_LIMIT)

            if (recommendations.length === 0) {
                return interaction.editReply({
                    content: `${emojis.warning} | 暫時找不到新的推薦歌曲，試試稍後再按一次。`
                })
            }

            player.queue.add(recommendations)
            if (!player.playing && !player.paused) await player.play()
            await updateMusicPlayerStatus(client, interaction.guildId!)

            const embed = new EmbedBuilder()
                .setColor(0xA3A3A3)
                .setTitle('已加入推薦歌曲')
                .setDescription(
                    recommendations
                        .map((track: Track, index: number) => `**${index + 1}.** [${track.title}](${track.uri}) · ${track.author || '未知作者'}`)
                        .join('\n')
                )
                .setFooter({ text: `依照目前播放歌曲推薦 · 共 ${recommendations.length} 首` })

            return interaction.editReply({ embeds: [embed] })
        } catch (error) {
            console.error('[Music Related] 推薦歌曲失敗:', error)
            return interaction.editReply({
                content: `${emojis.outage} | 推薦歌曲時發生錯誤，請稍後再試。`
            })
        }
    }
} satisfies ButtonType
