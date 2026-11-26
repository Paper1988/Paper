import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import MusicRenderer from '@/Systems/Music/MusicRenderer.js'
import MusicUtils, { deleteMessageAfter, getInterval } from '@/Systems/Music/MusicUtils.js'
import emojis from '@/libs/emoji/emoji.js'
import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    EmbedBuilder,
    TextChannel,
    type VoiceBasedChannel
} from 'discord.js'
import { Player, Track } from 'moonlink.js'

// ==================== MusicController ====================

export class MusicController {
    // ==================== Player Lifecycle ====================

    /**
     * 清除播放器狀態並停止進度條 interval
     */
    static clearPlayer(player: Player, client: PaperClient): void {
        MusicController.resetPlayer(player, client)
        client.musicSessions.clearProgressUpdater(player.guildId)
    }

    /**
     * 重置播放器的訊息 ID 記錄
     */
    static resetPlayer(player: Player, client: PaperClient): void {
        client.musicSessions.setControllerMessageId(player.guildId, undefined)
    }

    /**
     * 啟動進度條自動更新 interval
     */
    static startProgressUpdater(player: Player, client: PaperClient): void {
        // 清除舊的 interval（如果存在）
        client.musicSessions.clearProgressUpdater(player.guildId)
        if (!player.current) return

        const interval = setInterval(
            () => {
                if (!player.playing || player.paused) return
                MusicController.updatePlayerStatus(player, client).catch(console.error)
            },
            getInterval(player.current ?? ({ isStream: false } as Track))
        )
        client.musicSessions.setProgressUpdater(player.guildId, interval)
    }

    /**
     * 停止進度條更新 interval
     */
    static stopProgressUpdater(player: Player, client: PaperClient): void {
        client.musicSessions.clearProgressUpdater(player.guildId)
    }

    /**
     * 更新音樂播放器控制訊息至最新狀態
     */
    static async updatePlayerStatus(
        player: Player,
        client: PaperClient,
        completed?: boolean
    ): Promise<void> {
        if (!player.textChannelId) return

        const musicControllerMsgId = client.musicSessions.getControllerMessageId(player.guildId)
        if (!musicControllerMsgId) return

        const msg = (
            client.channels.cache.get(player.textChannelId) as TextChannel
        ).messages.cache.get(musicControllerMsgId)

        if (!msg) {
            client.musicSessions.setControllerMessageId(player.guildId, undefined)
            return
        }

        const track = player.current
        if (!track) {
            MusicController.clearPlayer(player, client)
            return
        }

        if (completed) MusicController.resetPlayer(player, client)
        await msg.edit(MusicRenderer.buildPlayerStatus(player, client, track, completed))
    }

    // ==================== Validation ====================

    /**
     * 檢查語音頻道的相關條件，若未通過則自動回覆錯誤訊息
     */
    static async validateVoiceChannel(
        interaction: ChatInputCommandInteraction | ButtonInteraction,
        client: PaperClient,
        voiceChannel: VoiceBasedChannel | null | undefined
    ): Promise<boolean> {
        if (!voiceChannel) {
            await interaction
                .editReply({
                    content: `${emojis.warning} | 你必須待在語音頻道裡面才能使用音樂指令!`
                })
                .then(deleteMessageAfter)
            return false
        }

        const currentPlayer = await client.musicManager?.getPlayer(interaction.guildId!)
        if (currentPlayer?.voiceChannelId && voiceChannel.id !== currentPlayer.voiceChannelId) {
            await interaction
                .editReply({
                    content: `${emojis.warning} | 我已經在語音頻道 - <#${currentPlayer.voiceChannelId}> 裡播放音樂了`
                })
                .then(deleteMessageAfter)
            return false
        }

        if (!voiceChannel.joinable) {
            await interaction
                .editReply({
                    content: '',
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('拒絕請求')
                            .setDescription(
                                `${emojis.warning} | 我沒有權限進入 <#${voiceChannel.id}>!`
                            )
                            .setColor('Red')
                    ]
                })
                .then(deleteMessageAfter)
            return false
        }

        return true
    }

    static scheduleAutoLeave(player: Player, client: PaperClient): void {
        const textChannelId = player.textChannelId

        MusicUtils.sendQueueMessage(
            player,
            client,
            `${emojis.musicstop} | 佇列已播放完畢`,
            'Red'
        )?.catch(console.error)

        const timeout = setTimeout(async () => {
            try {
                if (!player.playing && player.queue.size === 0) {
                    player.destroy('queueEndTimeout')
                    const channel = client.channels.cache.get(textChannelId)
                    if (channel && channel.isTextBased() && 'send' in channel) {
                        await channel
                            .send({
                                embeds: [
                                    new EmbedBuilder()
                                        .setColor('Red' as `#${string}`)
                                        .setDescription(
                                            `${emojis.disconnect} | 已自動離開語音頻道。`
                                        )
                                ]
                            })
                            .then(deleteMessageAfter)
                    }
                }
            } catch (error) {
                MusicUtils.handleMusicError(error, client, player, '自動離開語音頻道時發生錯誤')
            }
        }, 30000)
        client.musicSessions.setQueueEndTimeout(player.guildId, timeout)
    }
}

export default MusicController
