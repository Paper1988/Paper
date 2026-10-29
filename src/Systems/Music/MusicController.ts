import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import MusicRenderer from '@/Systems/Music/MusicRenderer.js'
import MusicDB from '@/Structures/Schemas/MusicDB.js'
import MusicUtils, { deleteMessageAfter, getInterval } from '@/Systems/Music/MusicUtils.js'
import emojis from '@/libs/emoji/emoji.js'
import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    EmbedBuilder,
    TextChannel,
    MessageFlags,
    type AnySelectMenuInteraction,
    ModalSubmitInteraction,
    type VoiceBasedChannel
} from 'discord.js'
import { Player, Track } from 'moonlink.js'

// ==================== MusicController ====================

export class MusicController {
    // ==================== Player Lifecycle ====================

    /**
     * 清除播放器狀態並停止進度條 interval
     */
    static clearPlayer(player: Player): void {
        MusicController.resetPlayer(player)
        const intervalId = player.data.playerIntervalId as NodeJS.Timeout
        if (intervalId) {
            clearInterval(intervalId)
        }
    }

    /**
     * 重置播放器的訊息 ID 記錄
     */
    static resetPlayer(player: Player): void {
        player.set('musicControllerMsgId', undefined)
    }

    /**
     * 啟動進度條自動更新 interval
     */
    static startProgressUpdater(player: Player, client: PaperClient): void {
        // 清除舊的 interval（如果存在）
        if (player.data.playerIntervalId) {
            clearInterval(player.data.playerIntervalId as NodeJS.Timeout)
        }

        if (!player.current) return

        player.set(
            'playerIntervalId',
            setInterval(
                () => {
                    if (!player.playing || player.paused) return
                    MusicController.updatePlayerStatus(player, client).catch(console.error)
                },
                getInterval(player.current ?? ({ isStream: false } as Track))
            )
        )
    }

    /**
     * 停止進度條更新 interval
     */
    static stopProgressUpdater(player: Player): void {
        if (player.data.playerIntervalId) {
            clearInterval(player.data.playerIntervalId as NodeJS.Timeout)
            player.set('playerIntervalId', undefined)
        }
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

        const musicControllerMsgId = player.data.musicControllerMsgId as string
        if (!musicControllerMsgId) return

        const msg = (
            client.channels.cache.get(player.textChannelId) as TextChannel
        ).messages.cache.get(musicControllerMsgId)

        if (!msg) {
            player.set('musicControllerMsgId', undefined)
            return
        }

        const track = player.current
        if (!track) {
            MusicController.clearPlayer(player)
            return
        }

        if (completed) MusicController.resetPlayer(player)
        await msg.edit(MusicRenderer.buildPlayerStatus(player, client, track, completed))
    }

    // ==================== Validation ====================

    /** Only members with the configured DJ role ID can use music control interactions. */
    static async validateDJRole(interaction: ButtonInteraction | ModalSubmitInteraction | AnySelectMenuInteraction, client: PaperClient): Promise<boolean> {
        const guild = interaction.guild
        if (!guild) {
            await interaction.reply({ content: `${emojis.warning} | 此控制面板只能在 Discord 伺服器內使用。`, flags: MessageFlags.Ephemeral }).catch(() => undefined)
            return false
        }

        const settings = await MusicDB.findOne({ GuildID: guild.id }).catch(() => null)
        if (settings?.DJModeEnabled === false) return true

        // The requester of the currently playing track may control their own song.
        const player = client.moonlink?.players.get(guild.id)
        if (player?.current?.requester === interaction.user.id) return true

        if (!settings?.DJRoleID) {
            await interaction.reply({
                content: `${emojis.warning} | 此伺服器尚未設定 DJ 身份組，請管理員使用 \`/music dj create\` 或 \`/music dj bind\` 設定。`,
                flags: MessageFlags.Ephemeral
            }).catch(() => undefined)
            return false
        }

        const member = await guild.members.fetch(interaction.user.id).catch(() => null)
        if (member?.roles.cache.has(settings.DJRoleID)) return true

        await interaction.reply({
            content: `${emojis.warning} | 只有具備已設定 DJ 身份組的成員可以操作音樂控制面板。`,
            flags: MessageFlags.Ephemeral
        }).catch(() => undefined)
        return false
    }

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

        const currentPlayer = client.moonlink?.players.get(interaction.guildId!) as Player
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

        player.set(
            'queueEndTimeout',
            setTimeout(async () => {
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
        )
    }
}

export default MusicController
