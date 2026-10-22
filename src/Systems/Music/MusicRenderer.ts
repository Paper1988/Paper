import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import {
    MusicUtils,
    PROGRESS_BAR_LENGTH,
    VOLUME_MAX,
    VOLUME_MIN
} from '@/Systems/Music/MusicUtils.js'
import emojis from '@/libs/emoji/emoji.js'
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    MessageFlags,
    SectionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
    VoiceChannel,
    type MessageActionRowComponentBuilder
} from 'discord.js'
import { Player, Track } from 'moonlink.js'

// ==================== MusicRenderer ====================

export class MusicRenderer {
    /**
     * 生成音樂播放器的三排圖示控制按鈕
     */
    static buildButtons(player: Player) {
        const createButton = (
            customId: string,
            emoji: string,
            style: ButtonStyle,
            disabled = false
        ) =>
            new ButtonBuilder()
                .setCustomId(customId)
                .setEmoji(emoji)
                .setStyle(style)
                .setDisabled(disabled)

        const row1 = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
            createButton(
                'autoplay',
                emojis.update,
                player.autoPlay ? ButtonStyle.Success : ButtonStyle.Secondary
            ),
            createButton(
                'previous',
                emojis.backforward,
                ButtonStyle.Secondary,
                player.previous.length === 0
            ),
            createButton(
                'togglePause',
                player.paused ? emojis.play : emojis.pause,
                player.paused ? ButtonStyle.Primary : ButtonStyle.Secondary
            ),
            createButton(
                'skip',
                emojis.frontforward,
                ButtonStyle.Secondary,
                player.autoPlay ? false : player.queue.tracks.length < 1
            ),
            createButton('shuffle', emojis.shuffle, ButtonStyle.Secondary)
        ])

        const row2 = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
            createButton('loop', emojis.loop2, player.loop !== 'off' ? ButtonStyle.Success : ButtonStyle.Secondary),
            createButton(
                'volumeDown',
                emojis.speaker_low,
                ButtonStyle.Secondary,
                player.volume <= VOLUME_MIN
            ),
            createButton('stop', emojis.stop, ButtonStyle.Danger),
            createButton(
                'volumeUp',
                emojis.speaker,
                ButtonStyle.Secondary,
                player.volume >= VOLUME_MAX
            ),
            createButton('related', emojis.add, ButtonStyle.Secondary)
        ])

        const row3 = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
            createButton('queue', emojis.queue, ButtonStyle.Secondary),
            createButton('addSong', emojis.friend, ButtonStyle.Secondary),
            createButton('lyrics', emojis.list, ButtonStyle.Secondary),
            createButton('playlist:save', emojis.download, ButtonStyle.Secondary)
        ])

        return [row1, row2, row3]
    }

    /**
     * 生成 Components V2 音樂播放器（歌曲資訊、縮圖與控制按鈕）
     */
    static buildPlayerStatus(player: Player, client: PaperClient, track: Track, completed = false) {
        if (!track?.title || !player) {
            console.error('MusicRenderer: Missing required properties', {
                track: !!track,
                player: !!player
            })

            return {
                components: [
                    new ContainerBuilder()
                        .setAccentColor(0xA3A3A3)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(
                                `## ${emojis.outage} 無法獲取歌曲資訊`
                            )
                        )
                ],
                flags: MessageFlags.IsComponentsV2
            }
        }

        const songDuration = track.duration || 0
        const currentPosition = completed ? songDuration : track.position
        const isLive = track.isStream || !songDuration

        const getProgressDisplay = () => {
            if (isLive) return '🔴 直播中'
            return `\x60${MusicUtils.millisToDuration(currentPosition)}\x60 - \x60${MusicUtils.millisToDuration(songDuration)}\x60`
        }

        const getRepeatModeText = () => {
            if (player.loop === 'off') return emojis.xmark
            return player.loop === 'queue' ? '整個佇列' : '單曲'
        }

        const barLength = track.sourceName === 'spotify' ? 21 : PROGRESS_BAR_LENGTH
        const progressBar = isLive
            ? '🔴 直播中'
            : MusicUtils.generateProgressBar(currentPosition, songDuration, barLength)

        const voiceChannel = client.channels.cache.get(player.voiceChannelId) as
            | VoiceChannel
            | undefined
        const repeatMode = getRepeatModeText()
        const playlistCount = player.queue.tracks.length + 1

        const songDetails = new TextDisplayBuilder().setContent([
            `## ${emojis.music} [${track.title}](${track.uri}) - ${MusicUtils.millisToDuration(songDuration)}`,
            `**${track.author || '無'}**`
        ].join('\n'))

        // Keep the original compact field-style grouping inside the Components V2 container.
        const metadata = new TextDisplayBuilder().setContent([
            `${emojis.speaker} **音量** \`${player.volume}%\`　 ${emojis.loop1} **重複播放** ${repeatMode}　 ${emojis.update} **自動播放** ${player.autoPlay ? emojis.correct : emojis.xmark}`,
            `${emojis.clock} **進度** ${getProgressDisplay()}　 ${emojis.people} **作者** \`${track.author || '無'}\`　 ${emojis.playlist} **播放清單** \`${playlistCount} 首歌曲\``,
            '',
            '**進度條**',
            progressBar,
            `-# 在 ${voiceChannel?.name ?? '未知頻道'} 中播放`
        ].join('\n'))

        const panel = new ContainerBuilder().setAccentColor(player.paused ? 0xFAA61A : 0x57F287)

        if (track.thumbnail) {
            panel.addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(songDetails)
                    .setThumbnailAccessory(new ThumbnailBuilder().setURL(track.thumbnail))
            )
        } else {
            panel.addTextDisplayComponents(songDetails)
        }

        panel.addTextDisplayComponents(metadata)

        return {
            components: completed ? [panel] : [panel, ...MusicRenderer.buildButtons(player)],
            flags: MessageFlags.IsComponentsV2
        }
    }
}

export default MusicRenderer
