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
                '♾️',
                player.autoPlay ? ButtonStyle.Success : ButtonStyle.Secondary
            ),
            createButton(
                'previous',
                '⏮️',
                ButtonStyle.Secondary,
                player.previous.length === 0
            ),
            createButton(
                'togglePause',
                player.paused ? '▶️' : '⏸️',
                player.paused ? ButtonStyle.Primary : ButtonStyle.Secondary
            ),
            createButton(
                'skip',
                '⏭️',
                ButtonStyle.Secondary,
                player.autoPlay ? false : player.queue.tracks.length < 1
            ),
            createButton('shuffle', '🔀', ButtonStyle.Secondary)
        ])

        const row2 = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
            createButton(
                'loop',
                '🔁',
                player.loop !== 'off' ? ButtonStyle.Success : ButtonStyle.Secondary
            ),
            createButton(
                'volumeDown',
                '🔉',
                ButtonStyle.Secondary,
                player.volume <= VOLUME_MIN
            ),
            createButton('stop', '⏹️', ButtonStyle.Danger),
            createButton(
                'volumeUp',
                '🔊',
                ButtonStyle.Secondary,
                player.volume >= VOLUME_MAX
            ),
            createButton('related', '✨', ButtonStyle.Secondary)
        ])

        const row3 = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
            createButton('queue', '📜', ButtonStyle.Secondary),
            createButton('addSong', '➕', ButtonStyle.Secondary),
            createButton('lyrics', '🎤', ButtonStyle.Secondary),
            createButton('playlist:save', '💾', ButtonStyle.Secondary)
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
            return `\x60${MusicUtils.millisToDuration(currentPosition)}\x60 / \x60${MusicUtils.millisToDuration(songDuration)}\x60`
        }

        const getRepeatModeText = () => {
            if (player.loop === 'off') return '關閉'
            return player.loop === 'queue' ? '整個佇列' : '單曲'
        }

        const barLength = track.sourceName === 'spotify' ? 21 : PROGRESS_BAR_LENGTH
        const progressBar = isLive
            ? '🔴 直播中'
            : MusicUtils.generateProgressBar(currentPosition, songDuration, barLength)

        const voiceChannel = client.channels.cache.get(player.voiceChannelId) as
            | VoiceChannel
            | undefined
        const requester = client.users.cache.get(track.requester)?.username ?? '未知用戶'
        const status = player.paused ? '已暫停' : isLive ? '直播中' : '播放中'

        const songDetails = new TextDisplayBuilder().setContent([
            `## [${track.title}](${track.uri})`,
            `**${track.author || '未知作者'}**`,
            '',
            progressBar,
            getProgressDisplay()
        ].join('\n'))

        const metadata = new TextDisplayBuilder().setContent([
            `**音量**  ${player.volume}%`,
            `**播放模式**  ${getRepeatModeText()}`,
            `**自動播放**  ${player.autoPlay ? '開啟' : '關閉'}`,
            `**佇列**  ${player.queue.tracks.length} 首待播`,
            `**點播者**  ${requester}`,
            `**狀態**  ${status}`,
            `-# 語音頻道 · ${voiceChannel?.name ?? '未知頻道'}`
        ].join('\n'))

        const panel = new ContainerBuilder()
            .setAccentColor(0xA3A3A3)
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(songDetails)
                    .setThumbnailAccessory(
                        new ThumbnailBuilder().setURL(track.thumbnail || client.user!.displayAvatarURL())
                    )
            )
            .addTextDisplayComponents(metadata)

        return {
            components: completed ? [panel] : [panel, ...MusicRenderer.buildButtons(player)],
            flags: MessageFlags.IsComponentsV2
        }
    }
}

export default MusicRenderer
