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
    EmbedBuilder,
    VoiceChannel,
    type MessageActionRowComponentBuilder
} from 'discord.js'
import { Player, Track } from 'moonlink.js'

// ==================== MusicRenderer ====================

export class MusicRenderer {
    /**
     * 生成音樂播放器的三排控制按鈕
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
            createButton(
                'loop',
                emojis.loop2,
                player.loop !== 'off' ? ButtonStyle.Success : ButtonStyle.Secondary
            ),
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
     * 生成音樂播放器嵌入訊息的完整 payload（embed + components）
     */
    static buildPlayerStatus(player: Player, client: PaperClient, track: Track, completed = false) {
        if (!track?.title || !player) {
            console.error('MusicRenderer: Missing required properties', {
                track: !!track,
                player: !!player
            })
            return {
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(`${emojis.outage} | 無法獲取歌曲資訊`)
                ]
            }
        }

        const songDuration = track.duration || 0
        const currentPosition = completed ? songDuration : track.position
        const isLive = track.isStream || !songDuration

        const getProgressDisplay = () => {
            if (isLive) return '🔴 直播中'
            return `\`${MusicUtils.millisToDuration(currentPosition)}\` - \`${MusicUtils.millisToDuration(songDuration)}\``
        }

        const getRepeatModeText = () => {
            if (player.loop === 'off') return emojis.xmark
            return player.loop === 'queue' ? '整個佇列' : '單曲'
        }

        const barLength = track.sourceName === 'spotify' ? 21 : PROGRESS_BAR_LENGTH
        const progressBar = isLive
            ? `🔴 直播中`
            : MusicUtils.generateProgressBar(currentPosition, songDuration, barLength)

        const voiceChannel = client.channels.cache.get(player.voiceChannelId) as
            | VoiceChannel
            | undefined

        return {
            embeds: [
                new EmbedBuilder()
                    .setColor(0xA3A3A3)
                    .setTitle(track.title)
                    .setURL(track.uri)
                    .setDescription(
                        [
                            `**${track.author || '未知作者'}**`,
                            '',
                            progressBar,
                            getProgressDisplay()
                        ].join('\n')
                    )
                    .setAuthor({
                        name: player.paused ? '正在暫停' : isLive ? '正在直播' : '正在播放',
                        iconURL:
                            client.users.cache.get(track.requester)?.displayAvatarURL() ?? undefined
                    })
                    .addFields(
                        {
                            name: '音量',
                            value: `\`${player.volume}%\``,
                            inline: true
                        },
                        {
                            name: '播放模式',
                            value: getRepeatModeText(),
                            inline: true
                        },
                        {
                            name: '自動播放',
                            value: player.autoPlay ? '開啟' : '關閉',
                            inline: true
                        },
                        {
                            name: '佇列',
                            value: `\`${player.queue.tracks.length} 首待播\``,
                            inline: true
                        },
                        {
                            name: '點播者',
                            value: client.users.cache.get(track.requester)?.username ?? '未知用戶',
                            inline: true
                        },
                        {
                            name: '狀態',
                            value: player.paused ? '已暫停' : '播放中',
                            inline: true
                        }
                    )
                    .setThumbnail(track.thumbnail || null)
                    .setFooter({
                        text: `語音頻道 · ${voiceChannel?.name ?? '未知頻道'}`
                    })
            ],
            components: completed ? [] : MusicRenderer.buildButtons(player)
        }
    }
}

export default MusicRenderer
