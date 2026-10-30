import { PaperClient } from '@/Structures/classes/PaperClient.js'
import MusicController from '@/Systems/Music/MusicController.js'
import MusicRenderer from '@/Systems/Music/MusicRenderer.js'
import MusicRepository from '@/Systems/Music/MusicRepository.js'
import { MusicStateManager } from '@/Systems/Music/MusicStateManager.js'
import MusicUtils, { deleteMessageAfter } from '@/Systems/Music/MusicUtils.js'
import { assessTrackMatch } from '@/Systems/Music/TrackMatcher.js'
import emojis from '@/libs/emoji/emoji.js'
import { Logger } from '@/libs/utils/logger.js'
import { EmbedBuilder, Message, TextChannel } from 'discord.js'
import { Track } from 'moonlink.js'
import type { INode } from 'moonlink.js/dist/src/typings/Interfaces'

const DEBUG_WEBHOOK_ID = process.env.DEBUG_WEBHOOK_ID!
const DEBUG_WEBHOOK_TOKEN = process.env.DEBUG_WEBHOOK_TOKEN!

export function registerMoonlinkEvents(client: PaperClient): void {
    if (!client.moonlink) return

    /** ----- Node Events ----- */
    client.moonlink.on('nodeConnected', (node: INode) =>
        Logger.info(`Node ${node.identifier} connected!`)
    )
    client.moonlink.on('nodeReady', (node, stats) => {
        console.info(`Node ${node.identifier} is ready`, stats)
    })
    client.moonlink.on('nodeReconnect', (node) => {
        console.info(`[NODE] Reconnection attempt:`, {
            identifier: node.identifier,
            attempt: node.retryAmount,
            delay: node.retryDelay
        })
    })
    client.moonlink.on('nodeDisconnect', (node: INode, code, reason) => {
        console.info(`Node ${node.identifier} disconnected`, {
            identifier: node.identifier,
            code: code,
            reason: reason
        })
    })
    client.moonlink.on('nodeError', (node: INode, error: Error) =>
        Logger.error(error, `Node ${node.identifier} error:`, {
            identifier: node.identifier,
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            }
        })
    )
    client.moonlink.on('nodeDestroy', (identifier) => {
        console.info(`[NODE] Destroyed:`, {
            identifier: identifier,
            timestamp: new Date().toISOString()
        })
    })

    /** ----- Player Events ----- */
    client.moonlink.on('trackStart', async (player, track) => {
        try {
            if (player.data.queueEndTimeout) {
                clearTimeout(player.data.queueEndTimeout as NodeJS.Timeout)
            }
            const mirroredTrack = track.pluginInfo?.mirroredTrack as
                | {
                      title?: string
                      author?: string
                      length?: number
                      duration?: number
                      sourceName?: string
                  }
                | undefined
            const mirroredSourceName = mirroredTrack?.sourceName
            player.set('mirroredSourceName', mirroredSourceName)

            if (mirroredTrack) {
                const assessment = assessTrackMatch(
                    {
                        title: track.title,
                        author: track.author,
                        durationMs: track.duration
                    },
                    {
                        title: mirroredTrack.title,
                        author: mirroredTrack.author,
                        durationMs: mirroredTrack.length ?? mirroredTrack.duration
                    }
                )

                if (!assessment.trusted) {
                    const details = {
                        guildId: player.guildId,
                        original: `${track.title} - ${track.author}`,
                        mirrored: `${mirroredTrack.title ?? '未知歌曲'} - ${mirroredTrack.author ?? '未知歌手'}`,
                        source: mirroredSourceName ?? 'unknown',
                        score: Number(assessment.score.toFixed(3)),
                        titleSimilarity: Number(assessment.titleSimilarity.toFixed(3)),
                        artistSimilarity: Number(assessment.artistSimilarity.toFixed(3)),
                        durationSimilarity: assessment.durationSimilarity,
                        versionMismatch: assessment.versionMismatch
                    }
                    Logger.warn('拒絕播放低可信度的替代音源:', details)

                    await MusicUtils.sendQueueMessage(
                        player,
                        client,
                        `${emojis.warning} | 替代音源與原曲相似度不足，為避免播放錯誤歌曲，已自動跳過「${track.title}」。`,
                        'Red'
                    )
                    await player.skip()
                    return
                }

                Logger.info('Fallback track match accepted:', {
                    guildId: player.guildId,
                    title: track.title,
                    source: mirroredSourceName,
                    score: Number(assessment.score.toFixed(3))
                })
            }

            const db = await MusicRepository.fetchGuildSettings(player.guildId)
            player.setVolume(db.volume)
            player.setLoop(db.repeatMode)
            const textChannel = client.channels.cache.get(player.textChannelId) as
                | TextChannel
                | undefined
            const status = MusicRenderer.buildPlayerStatus(player, client, track)
            if (textChannel && textChannel.isTextBased() && 'send' in textChannel) {
                const controllerMessageId = MusicStateManager.getControllerMessageId(player)
                let controllerMessage: Message | undefined

                if (controllerMessageId) {
                    try {
                        controllerMessage = await textChannel.messages.fetch(controllerMessageId)
                        await controllerMessage.edit(status)
                    } catch {
                        MusicStateManager.resetControllerMessageId(player)
                    }
                }

                if (!controllerMessage) {
                    await textChannel
                        .send(status)
                        .then((msg: Message) =>
                            MusicStateManager.setControllerMessageId(player, msg.id)
                        )
                }

                MusicController.startProgressUpdater(player, client)
            }
        } catch (error: any) {
            MusicUtils.handleMusicError(error, client, player, '播放歌曲時發生錯誤')
            MusicController.stopProgressUpdater(player)
            Logger.error('發送 trackStart 訊息失敗:', error.stack)
        }
    })

    client.moonlink.on('trackEnd', async (player, track, reason, payload) => {
        switch (reason) {
            case 'finished':
            case 'cleanup':
            case 'replaced':
                try {
                    let shouldClearPlayer = false
                    if (player.loop === 'off') {
                        if (!player.queue.tracks[0] && !player.autoPlay) {
                            // 無循環且沒有下一首歌：顯示完成狀態
                            await MusicController.updatePlayerStatus(player, client, true)
                            shouldClearPlayer = true
                        }
                        // else：有下一首或有自動播放，由 trackStart 建立新的播放器狀態
                    } else if (player.loop === 'track') {
                        // 單曲循環：保持播放器狀態
                        await MusicController.updatePlayerStatus(player, client, false)
                    } else if (player.loop === 'queue') {
                        // 佇列循環模式
                        if (player.queue.tracks.length === 1) {
                            // 佇列中只有一首歌：保持播放器狀態（因為會循環播放同一首）
                            await MusicController.updatePlayerStatus(player, client, false)
                        } else {
                            // 佇列中有多首歌：保留控制訊息，下一首歌開始時直接編輯同一則訊息
                            await MusicController.updatePlayerStatus(player, client, false)
                        }
                    }
                    MusicController.stopProgressUpdater(player)
                    if (shouldClearPlayer) MusicController.clearPlayer(player)
                } catch (error) {
                    MusicUtils.handleMusicError(error, client, player, '發生未知錯誤')
                }
                break

            case 'stopped':
                try {
                    MusicController.stopProgressUpdater(player)
                    if (player.queue.tracks.length === 0 && !player.autoPlay) {
                        await MusicController.updatePlayerStatus(player, client, true)
                        MusicController.clearPlayer(player)
                        MusicController.scheduleAutoLeave(player, client)
                    } else {
                        await MusicController.updatePlayerStatus(player, client, false)
                    }
                } catch (error) {
                    MusicUtils.handleMusicError(error, client, player, '發生未知錯誤')
                }
                break

            case 'loadFailed':
                try {
                    MusicController.clearPlayer(player)

                    MusicController.stopProgressUpdater(player)
                } catch (error) {
                    MusicUtils.handleMusicError(error, client, player, '發生未知錯誤')
                }
                break
        }
    })

    client.moonlink.on('queueAdd', async (player, tracks) => {
        const oldMessage = player.data.musicControllerMsgId as Message['id']

        try {
            const track = (tracks[0] as Track) || (tracks as Track)
            if (!track) return
            if (oldMessage) {
                const channel = client.channels.cache.get(player.textChannelId)
                if (channel && channel.isTextBased()) {
                    await channel.messages.fetch(oldMessage).then((msg) => {
                        if (msg && !player.playing && !player.paused) {
                            MusicController.updatePlayerStatus(player, client, false)
                        }
                    })
                }
            }

            let msg: string
            if (Array.isArray(tracks) && tracks.length > 1) {
                msg = `${emojis.plus} | 已加入 (\`${tracks.length}\`首歌) 到清單中`
            } else {
                msg = `${emojis.plus} | 已加入 [${track.title}](${track.uri}) - \`${MusicUtils.millisToDuration(track.duration)}\` 到佇列中`
            }
            MusicUtils.sendQueueMessage(player, client, msg, 'Green')?.catch(console.error)
        } catch (error) {
            MusicUtils.handleMusicError(error, client, player, '處理 queueAdd 事件時發生錯誤')
        }
    })

    client.moonlink.on('queueEnd', async (player) => {
        try {
            MusicController.stopProgressUpdater(player)
            MusicController.clearPlayer(player)

            MusicUtils.sendQueueMessage(
                player,
                client,
                `${emojis.musicstop} | 佇列已播放完畢`,
                'Red'
            )?.catch(console.error)

            // 先存好 textChannelId，destroy 後 player 狀態可能失效
            const textChannelId = player.textChannelId

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
                        MusicUtils.handleMusicError(
                            error,
                            client,
                            player,
                            '自動離開語音頻道時發生錯誤'
                        )
                    }
                }, 30000)
            )
        } catch (error) {
            MusicUtils.handleMusicError(error, client, player, '處理 queueEnd 事件時發生錯誤')
        }
    })

    client.moonlink.on('trackException', async (player, track, error) => {
        try {
            Logger.error('Track 播放發生異常:', error.stack)
            MusicUtils.handleMusicError(error, client, player, '播放歌曲時發生錯誤')
            const msg = `${emojis.outage} | 播放 [${track?.title ?? '未知歌曲'}] 時發生錯誤，已自動跳過`
            await MusicUtils.sendQueueMessage(player, client, msg, 'Red')
            player.skip()
        } catch (err) {
            Logger.error('處理 trackException 事件時發生錯誤:', err)
        }
    })

    client.moonlink.on('playerDestroy', async (player) => {
        try {
            Logger.info(`播放器被銷毀: ${player.guildId}`)
            MusicController.stopProgressUpdater(player)
            MusicController.clearPlayer(player)
        } catch (error) {
            Logger.error('處理 playerDestroy 事件時發生錯誤:', error)
        }
    })

    client.moonlink.on('playerTriggeredPlay', async (player) => {
        const db = await MusicRepository.fetchGuildSettings(player.guildId)
        player.setVolume(db.volume)
        player.setLoop(db.repeatMode)
    })

    client.moonlink.on('playerTriggeredPause', async (player) => {
        await MusicController.updatePlayerStatus(player, client, false)
    })

    client.moonlink.on('playerTriggeredResume', async (player) => {
        await MusicController.updatePlayerStatus(player, client, false)
    })

    /** ----- Auto Leave Event ----- */
    client.moonlink.on('autoLeaved', async (player) => {
        try {
            Logger.info(`[AutoLeave] Player in guild ${player.guildId} has auto-left.`)

            MusicController.stopProgressUpdater(player)
            MusicController.clearPlayer(player)
        } catch (error) {
            Logger.error('處理 autoLeaved 事件時發生錯誤:', error)
        }
    })

    client.moonlink.on('debug', async (...args) => {
        if (!DEBUG_WEBHOOK_ID || !DEBUG_WEBHOOK_TOKEN) return
        try {
            const webhook = await client.fetchWebhook(DEBUG_WEBHOOK_ID, DEBUG_WEBHOOK_TOKEN)
            await webhook.send({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`\`\`\`\n${args}\n\`\`\``)
                        .setTimestamp(new Date())
                ]
            })
        } catch (error) {
            Logger.error('發送調試消息時發生錯誤:', error)
        }
    })
}
