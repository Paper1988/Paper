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
import { checkMongoDBHealth, safeDbOperation } from '@/libs/utils/dbHealthCheck.js'
import { Logger } from '@/libs/utils/logger.js'
import type { EventType } from '@/typings/event.js'
import * as Sentry from '@sentry/node'

export default {
    name: Events.ClientReady,
    once: true,
    async execute(client: PaperClient) {
        if (!client) return

        Sentry.setContext('client', {
            username: client.user?.username,
            id: client.user?.id,
            guilds: client.guilds.cache.size
        })

        await Promise.all([
            loadCommands(client),
            loadButtons(client),
            loadModals(client),
            loadMenus(client)
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

        const dbHealthCheckInterval = setInterval(
            async () => {
                const healthStatus = await checkMongoDBHealth()
                if (healthStatus.status !== 'healthy') {
                    Logger.warn(`MongoDB 健康檢查失敗: ${healthStatus.details.readyStateDesc}`)
                    if (healthStatus.details.error) {
                        Logger.error(`錯誤詳情: ${healthStatus.details.error}`)
                    }

                    if (
                        mongoose.connection.readyState !== 1 &&
                        mongoose.connection.readyState !== 2
                    ) {
                        Logger.info('🔄 嘗試重新連線至 MongoDB...')
                        connectToDB(0, 3).catch((err) =>
                            Logger.error('健康檢查重連失敗:', err.stack)
                        )
                    }
                } else {
                    Logger.info(`MongoDB 健康檢查通過 (延遲: ${healthStatus.details.ping}ms)`)
                }
            },
            24 * 60 * 60 * 1000
        )

        client.once('shutdown', () => {
            if (dbHealthCheckInterval) clearInterval(dbHealthCheckInterval)
        })

        mongoose.connection.on('error', (error) => {
            Logger.error('MongoDB 連線錯誤:', error)
        })

        mongoose.connection.on('disconnected', async () => {
            Logger.info('MongoDB 連線斷開，嘗試重新連線...')
            await connectToDB().catch((err) => Logger.error('重連 MongoDB 失敗:', err.stack))
        })

        if (client.user?.id === '869166906765103135') {
            const Embed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`${client.user} 上線了!`)
                .setTimestamp()

            const webhook = await client.fetchWebhook(
                process.env.STARTUP_WEBHOOK_ID!,
                process.env.STARTUP_WEBHOOK_TOKEN!
            )
            await webhook.send({ embeds: [Embed] })
        }

        setInterval(() => updatePresence(client), 10 * 1000)

        setInterval(
            async () => {
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

                    for (const giveaway of giveaways) {
                        try {
                            await endGiveaway(giveaway.messageId, client)
                            Logger.info(`成功結束抽獎活動: ${giveaway.messageId}`)
                        } catch (error) {
                            Logger.error(
                                `結束抽獎活動時發生錯誤 (ID: ${giveaway.messageId}):`,
                                error
                            )

                            try {
                                await Giveaway.updateOne(
                                    { messageId: giveaway.messageId },
                                    { $set: { ended: true, hasError: true } }
                                )
                            } catch (dbError) {
                                Logger.error(`更新抽獎活動狀態失敗:`, dbError)
                            }
                        }
                    }

                    if (global.gc) {
                        global.gc()
                        Logger.info('已執行垃圾回收')
                    }
                } catch (mainError) {
                    Logger.error('定時任務執行時發生嚴重錯誤:', mainError)
                }
            },
            24 * 60 * 60 * 1000
        )
    }
} satisfies EventType

const connectToDB = async (retryCount = 0, maxRetries = 5): Promise<void> => {
    try {
        dns.setDefaultResultOrder('ipv4first')

        if (process.env.DATABASE_URI?.startsWith('mongodb+srv://')) {
            dns.setServers(['8.8.8.8', '8.8.4.4']) // 使用 Google DNS
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
    } catch (error) {
        Logger.error(`MongoDB 連線失敗 (嘗試 ${retryCount + 1}/${maxRetries}):`, error)

        console.error('完整錯誤:', JSON.stringify(error, null, 2))
        if (error instanceof Error) {
            console.error('錯誤訊息:', error.message)
            console.error('錯誤堆疊:', error.stack)
        }

        if (retryCount < maxRetries) {
            Logger.info(`🔄 ${5000}ms 後重試連線...`)
            await new Promise((resolve) => setTimeout(resolve, 5000))
            await connectToDB(retryCount + 1, maxRetries)
        } else {
            Logger.error(`已達最大重試次數 (${maxRetries})，無法連接到 MongoDB`)
            // 可以在這裡處理無法連線的情況，例如傳送通知或優雅地關閉 Bot
        }
    }
}

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
            await safeDbOperation(() =>
                Giveaway.updateOne({ messageId }, { $set: { ended: true, hasError: true } })
            )
            return
        }

        const message = await channel.messages.fetch(giveaway.messageId)
        if (!message) {
            Logger.warn(`找不到訊息: ${giveaway.messageId}`)
            await safeDbOperation(() =>
                Giveaway.updateOne({ messageId }, { $set: { ended: true, hasError: true } })
            )
            return
        }

        const winners = selectWinners(giveaway.participants, giveaway.winnerCount)
        const winnerMentions = winners.map((id) => `<@${id}>`).join(', ') || '沒有人參加抽獎'

        if (message.embeds.length > 0) {
            const originalDesc = message.embeds[0]?.data.description?.split('\n\n')[0] ?? ''

            const endEmbed = EmbedBuilder.from(message.embeds[0]!)
                .setColor('Green')
                .setDescription(
                    originalDesc + `\n\n<:person:1265561455529562154> | 得獎者：${winnerMentions}`
                )

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
                    .setDisabled(false)
            )

            await message.edit({
                embeds: [endEmbed],
                components: [endButtons]
            })
            if (winners.length > 0 && channel?.isTextBased()) {
                const textChannel = channel as TextChannel
                await textChannel.send({
                    content: `<:tada:1265562251981750272> 抽獎結束！\n恭喜 ${winnerMentions} 獲得 **${giveaway.prize}**！`,
                    allowedMentions: { users: winners }
                })
            }
        } else {
            Logger.warn('訊息中沒有嵌入內容')
            await safeDbOperation(() =>
                Giveaway.updateOne({ messageId }, { $set: { ended: true, hasError: true } })
            )
            return
        }

        giveaway.ended = true
        await safeDbOperation(() => giveaway.save())

        await safeDbOperation(async () => {
            const existingStats = await GiveawayStats.findOne({
                guildId: giveaway.guildId
            }).maxTimeMS(10000)
            const stats: any = existingStats ?? new GiveawayStats({ guildId: giveaway.guildId })
            stats.activeGiveaways = Math.max(0, (stats.activeGiveaways ?? 0) - 1)
            stats.totalWinners += winners.length

            for (const winnerId of winners) {
                // +1 因為本次抽獎的 GiveawayHistory 尚未存入，countDocuments 查不到這次
                const winHistory =
                    (await GiveawayHistory.countDocuments({
                        guildId: giveaway.guildId,
                        winners: winnerId
                    }).maxTimeMS(10000)) + 1

                const currentMostWon = stats.mostWonUser
                if (!currentMostWon || winHistory > (currentMostWon.count ?? 0)) {
                    stats.mostWonUser = {
                        userId: winnerId,
                        count: winHistory
                    }
                }
            }

            await stats.save()

            const history = new GiveawayHistory({
                guildId: giveaway.guildId,
                giveawayId: giveaway.messageId,
                prize: giveaway.prize,
                hosterId: giveaway.hostedBy,
                winners,
                participantCount: giveaway.participants.length,
                endTime: giveaway.endAt,
                requirements: {
                    roles: giveaway.requiredRoles,
                    minAccountAge: giveaway.minAccountAge,
                    minServerTime: giveaway.minServerTime
                }
            })

            await history.save()
        })

        Logger.info(`成功結束抽獎活動: ${messageId}，有 ${winners.length} 個獲獎者`)
    } catch (error) {
        Logger.error(`處理抽獎活動時發生錯誤 (ID: ${messageId}):`, error)
        await safeDbOperation(() =>
            Giveaway.updateOne({ messageId }, { $set: { ended: true, hasError: true } })
        )
    }
}

function selectWinners(participants: string[], count: number): string[] {
    const arr = [...participants]
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
    }
    return arr.slice(0, Math.min(count, arr.length))
}
