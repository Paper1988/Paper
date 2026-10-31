import { PaperClient } from '@/Structures/classes/PaperClient.js'
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    Events,
    TextChannel
} from 'discord.js'
import dns from 'dns'
import cron from 'node-cron'
import mongoose from 'mongoose'

import { loadButtons } from '@/Structures/Handlers/buttonHandler.js'
import { loadCommands } from '@/Structures/Handlers/commandHandler.js'
import { loadMenus } from '@/Structures/Handlers/menuHandler.js'
import { loadModals } from '@/Structures/Handlers/modalHandler.js'
import { updatePresence } from '@/libs/utils/updatePresence.js'

import Giveaway from '@/Structures/Schemas/Giveaway.js'
import GiveawayHistory from '@/Structures/Schemas/GiveawayHistory.js'
import GiveawayStats from '@/Structures/Schemas/GiveawayStats.js'

import { registerMoonlinkEvents } from '@/Systems/MoonlinkEvents.js'
import { reloadMusicNodes } from '@/Systems/Music/reloadMusicNodes.js'
import { checkMongoDBHealth, safeDbOperation } from '@/libs/utils/dbHealthCheck.js'
import { Logger } from '@/libs/utils/logger.js'
import type { EventType } from '@/typings/event.js'
import * as Sentry from '@sentry/node'

// ─── Constants ────────────────────────────────────────────────────────────────

const RETRY_DELAY_MS = 5000
const PRESENCE_INTERVAL_MS = 10 * 1000
const DAY_MS = 24 * 60 * 60 * 1000

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** 將抽獎標記為已結束（含錯誤），集中管理避免重複 */
const markGiveawayError = (messageId: string) =>
    safeDbOperation(() =>
        Giveaway.updateOne({ messageId }, { $set: { ended: true, hasError: true } })
    )

// ─── Event ────────────────────────────────────────────────────────────────────

export default {
    name: Events.ClientReady,
    once: true,
    async execute(client: PaperClient) {
        Sentry.setContext('client', {
            username: client.user?.username,
            id: client.user?.id,
            guilds: client.guilds.cache.size
        })

        await Promise.all([
            await loadCommands(client),
            await loadButtons(client),
            await loadModals(client),
            await loadMenus(client)
        ])

        if (client.moonlink && client.user?.id) {
            try {
                registerMoonlinkEvents(client)
                Logger.info('Moonlink 已成功初始化並註冊事件')
            } catch (error) {
                Logger.error('Moonlink 初始化失敗:', error)
            }
        }

        mongoose.set('strictQuery', false)
        await connectToDB()

        try {
            await client.startApiServer()
        } catch (error) {
            Logger.error('Failed to start API server:', error)
        }

        // MongoDB 健康檢查（每 24 小時）
        const dbHealthCheckInterval = setInterval(async () => {
            const healthStatus = await checkMongoDBHealth()
            if (healthStatus.status !== 'healthy') {
                Logger.warn(`MongoDB 健康檢查失敗: ${healthStatus.details.readyStateDesc}`)
                if (healthStatus.details.error) {
                    Logger.error(`錯誤詳情: ${healthStatus.details.error}`)
                }
                if (mongoose.connection.readyState !== 1 && mongoose.connection.readyState !== 2) {
                    Logger.info('🔄 嘗試重新連線至 MongoDB...')
                    connectToDB(0, 3).catch((err) =>
                        Logger.error('健康檢查重連失敗:', err.stack)
                    )
                }
            } else {
                Logger.info(`MongoDB 健康檢查通過 (延遲: ${healthStatus.details.ping}ms)`)
            }
        }, DAY_MS)

        // 抽獎到期檢查（每 24 小時）
        const giveawayInterval = setInterval(async () => {
            try {
                if (mongoose.connection.readyState !== 1) {
                    Logger.warn('MongoDB 連線未就緒，跳過定時任務...')
                    return
                }

                const giveaways = await Giveaway.find({
                    endAt: { $lt: new Date() },
                    ended: false
                }).maxTimeMS(20000)

                Logger.info(`找到 ${giveaways.length} 個需要結束的抽獎活動`)

                await Promise.all(
                    giveaways.map(async (giveaway) => {
                        try {
                            await endGiveaway(giveaway.messageId, client)
                            Logger.info(`成功結束抽獎活動: ${giveaway.messageId}`)
                        } catch (error) {
                            Logger.error(`結束抽獎活動時發生錯誤 (ID: ${giveaway.messageId}):`, error)
                            await Giveaway.updateOne(
                                { messageId: giveaway.messageId },
                                { $set: { ended: true, hasError: true } }
                            ).catch((dbError) => Logger.error('更新抽獎活動狀態失敗:', dbError))
                        }
                    })
                )

                if (global.gc) {
                    global.gc()
                    Logger.info('已執行垃圾回收')
                }
            } catch (mainError) {
                Logger.error('定時任務執行時發生嚴重錯誤:', mainError)
            }
        }, DAY_MS)

        // 每天 09:00、21:00（台灣時間）排程重新載入音樂節點
        let nodeReloadPending = false

        const attemptNodeReload = () => {
            if (!nodeReloadPending) return

            if (!client.moonlink) {
                Logger.warn('定時重新載入音樂節點：Moonlink 尚未啟用，取消本次任務')
                nodeReloadPending = false
                return
            }

            const activePlayers = client.moonlink.players.all.filter(
                (player) => player.playing || player.paused
            )

            if (activePlayers.length > 0) {
                Logger.info(
                    `定時重新載入音樂節點延後：目前有 ${activePlayers.length} 個伺服器正在播放或暫停歌曲，將於 5 分鐘後重試`
                )
                return
            }

            try {
                const count = reloadMusicNodes(client)
                nodeReloadPending = false
                Logger.info(`定時重新載入音樂節點完成：已重新初始化 ${count} 個節點`)
            } catch (error) {
                Logger.error('定時重新載入音樂節點失敗:', error)
            }
        }

        const nodeReloadTask = cron.schedule(
            '0 9,21 * * *',
            () => {
                nodeReloadPending = true
                attemptNodeReload()
            },
            { timezone: 'Asia/Taipei' }
        )

        // 有歌曲播放或暫停時，每 5 分鐘重試，直到所有播放器都閒置
        const nodeReloadRetryInterval = setInterval(attemptNodeReload, 5 * 60 * 1000)

        // 關閉時清除所有定時器
        client.once('shutdown', () => {
            clearInterval(dbHealthCheckInterval)
            clearInterval(giveawayInterval)
            nodeReloadTask.stop()
            clearInterval(nodeReloadRetryInterval)
        })

        mongoose.connection.on('error', (error) => {
            Logger.error('MongoDB 連線錯誤:', error)
        })

        mongoose.connection.on('disconnected', async () => {
            Logger.info('MongoDB 連線斷開，嘗試重新連線...')
            await connectToDB().catch((err) => Logger.error('重連 MongoDB 失敗:', err.stack))
        })

        // 只在正式機器人上發送 webhook 上線通知
        if (client.user?.id === process.env.CLIENTID) {
            const embed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`${client.user} 上線了!`)
                .setTimestamp()

            const webhook = await client.fetchWebhook(
                process.env.STARTUP_WEBHOOK_ID!,
                process.env.STARTUP_WEBHOOK_TOKEN!
            )
            await webhook.send({ embeds: [embed] })
        }

        setInterval(() => updatePresence(client), PRESENCE_INTERVAL_MS)
    }
} satisfies EventType

// ─── DB Connection ────────────────────────────────────────────────────────────

/** 使用 for loop 取代遞迴，避免多次重試時的 call stack 增長 */
const connectToDB = async (startRetry = 0, maxRetries = 5): Promise<void> => {
    for (let attempt = startRetry; attempt <= maxRetries; attempt++) {
        try {
            dns.setDefaultResultOrder('ipv4first')

            if (process.env.DATABASE_URI?.startsWith('mongodb+srv://')) {
                dns.setServers(['8.8.8.8', '8.8.4.4']) // Google Public DNS
            }

            await mongoose.connect(process.env.DATABASE_URI!, {
                dbName: 'Js',
                connectTimeoutMS: 30000,
                socketTimeoutMS: 45000,
                serverSelectionTimeoutMS: 30000,
                heartbeatFrequencyMS: 10000,
                maxPoolSize: 10,
                retryWrites: true,
                retryReads: true
            })

            Logger.info(`成功連結到 MongoDB ${mongoose.connection.db!.databaseName}!`)
            return
        } catch (error) {
            Logger.error(`MongoDB 連線失敗 (嘗試 ${attempt + 1}/${maxRetries}):`, error)

            if (error instanceof Error) {
                Logger.error(`錯誤訊息: ${error.message}`)
                Logger.error(`錯誤堆疊: ${error.stack}`)
            }

            if (attempt < maxRetries) {
                Logger.info(`🔄 ${RETRY_DELAY_MS}ms 後重試連線...`)
                await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
            } else {
                Logger.error(`已達最大重試次數 (${maxRetries})，無法連接到 MongoDB`)
            }
        }
    }
}

// ─── Giveaway ─────────────────────────────────────────────────────────────────

async function endGiveaway(messageId: string, client: PaperClient): Promise<void> {
    const giveaway = await safeDbOperation(() =>
        Giveaway.findOne({ messageId, ended: false }).maxTimeMS(10000)
    )

    if (!giveaway) {
        Logger.warn(`找不到未結束的抽獎活動: ${messageId}`)
        return
    }

    try {
        const channel = await client.channels.fetch(giveaway.channelId)
        if (!channel?.isTextBased()) {
            Logger.warn(`找不到頻道或頻道不是文字頻道: ${giveaway.channelId}`)
            await markGiveawayError(messageId)
            return
        }

        const message = await channel.messages.fetch(giveaway.messageId)
        if (!message) {
            Logger.warn(`找不到訊息: ${giveaway.messageId}`)
            await markGiveawayError(messageId)
            return
        }

        // 提早 guard：沒有 embed 就無法處理
        if (message.embeds.length === 0) {
            Logger.warn('訊息中沒有嵌入內容')
            await markGiveawayError(messageId)
            return
        }

        const winners = selectWinners(giveaway.participants, giveaway.winnerCount)
        const winnerMentions = winners.map((id) => `<@${id}>`).join(', ') || '沒有人參加抽獎'
        const originalDesc = message.embeds[0]?.data.description ?? ''

        const endEmbed = EmbedBuilder.from(message.embeds[0]!)
            .setColor('Green')
            .setDescription(originalDesc + `\n\n<:person:1265561455529562154> | 得獎者：${winnerMentions}`)

        const endButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('giveaway-join')
                .setLabel('抽獎已結束')
                .setEmoji('<:wave:1320296301862191104>')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true),
            new ButtonBuilder()
                .setCustomId(`giveaway-reroll/${giveaway.hostedBy}`)
                .setLabel('重新抽獎')
                .setEmoji('🎲')
                .setStyle(ButtonStyle.Primary)
            // .setDisabled(false) 是預設值，不需要顯式設定
        )

        await message.edit({ embeds: [endEmbed], components: [endButtons] })

        // channel 已在上方確認為 isTextBased()，可安全 cast
        if (winners.length > 0) {
            await (channel as TextChannel).send({
                content: `<:tada:1265562251981750272> 抽獎結束！\n恭喜 ${winnerMentions} 獲得 **${giveaway.prize}**！`,
                allowedMentions: { users: winners }
            })
        }

        giveaway.ended = true
        await safeDbOperation(() => giveaway.save())

        await safeDbOperation(async () => {
            const existingStats = await GiveawayStats.findOne({ guildId: giveaway.guildId }).maxTimeMS(10000)
            const stats = existingStats ?? new GiveawayStats({ guildId: giveaway.guildId })

            stats.activeGiveaways = Math.max(0, (stats.activeGiveaways ?? 0) - 1)
            stats.totalParticipants += giveaway.participants.length
            stats.totalWinners += winners.length

            // 並行查詢每位得獎者的歷史勝場數（+1 因為本次 GiveawayHistory 尚未存入）
            const winHistories = await Promise.all(
                winners.map(async (id) => {
                    const count = await GiveawayHistory.countDocuments({
                        guildId: giveaway.guildId,
                        winners: id
                    }).maxTimeMS(10000)
                    return { id, count: count + 1 }
                })
            )

            for (const { id, count } of winHistories) {
                if (!stats.mostWonUser || count > (stats.mostWonUser.count ?? 0)) {
                    stats.mostWonUser = { userId: id, count }
                }
            }

            await stats.save()

            await new GiveawayHistory({
                guildId: giveaway.guildId,
                giveawayId: giveaway.messageId,
                prize: giveaway.prize,
                hostedBy: giveaway.hostedBy,
                winners,
                participantCount: giveaway.participants.length,
                endTime: giveaway.endAt,
                requirements: {
                    roles: giveaway.requiredRoles,
                    minAccountAge: giveaway.minAccountAge,
                    minServerTime: giveaway.minServerTime
                }
            }).save()
        })

        Logger.info(`成功結束抽獎活動: ${messageId}，有 ${winners.length} 個獲獎者`)
    } catch (error) {
        Logger.error(`處理抽獎活動時發生錯誤 (ID: ${messageId}):`, error)
        await markGiveawayError(messageId)
    }
}

// ─── Utils ────────────────────────────────────────────────────────────────────

/** Fisher-Yates shuffle，隨機選出獲獎者 */
function selectWinners(participants: string[], count: number): string[] {
    const arr = [...participants]
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
    }
    return arr.slice(0, Math.min(count, arr.length))
}
