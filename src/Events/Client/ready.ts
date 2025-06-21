import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Client,
    EmbedBuilder,
    Events,
    TextChannel
} from 'discord.js'
import mongoose from 'mongoose'

import { loadButtons } from '@/Structures/Handlers/buttonHandler.js'
import { loadCommands } from '@/Structures/Handlers/commandHandler.js'
import { loadMenus } from '@/Structures/Handlers/menuHandler.js'
import { loadModals } from '@/Structures/Handlers/modalHandler.js'
import { updatePresence } from '@/libs/utils/updatePresence.js'

import Giveaway from '@/Structures/Schemas/Giveaway.js'
import GiveawayHistory from '@/Structures/Schemas/GiveawayHistory.js'
import GiveawayStats from '@/Structures/Schemas/GiveawayStats.js'

import { registerDistubeEvents } from '@/Systems/DistubeEvents.js'
import { PaperClient } from '@/classes/PaperClient.js'
import { checkAndNotify } from '@/libs/utils/checkCookies.js'
import { checkMongoDBHealth, safeDbOperation } from '@/libs/utils/dbHealthCheck.js'
import type { EventType } from '@/typings/event.js'

export default {
    name: Events.ClientReady,
    once: true,
    async execute(client: PaperClient) {
        if (!client) return

        await Promise.all([
            loadCommands(client),
            loadButtons(client),
            loadModals(client),
            loadMenus(client)
        ])

        registerDistubeEvents(client)

        try {
            await client.startFastify()
        } catch (error) {
            console.error('Failed to start Fastify server:', error)
        }

        mongoose.set('strictQuery', false)

        const connectToDB = async (retryCount = 0, maxRetries = 5): Promise<void> => {
            try {
                await mongoose.connect(process.env.DATABASE_URL!, {
                    dbName: 'Js',
                    connectTimeoutMS: 30000, // 增加連線超時時間到 30 秒
                    socketTimeoutMS: 45000, // Socket 超時設為 45 秒
                    serverSelectionTimeoutMS: 30000, // 伺服器選擇超時時間為 30 秒
                    heartbeatFrequencyMS: 10000, // 心跳頻率為 10 秒
                    maxPoolSize: 10, // 連線池大小
                    retryWrites: true,
                    retryReads: true
                })
                console.log(`>>> ✅ 成功連結到 MongoDB ${mongoose.connection.db!.databaseName}!`)
            } catch (error) {
                console.error(
                    `>>> ❌ MongoDB 連線失敗 (嘗試 ${retryCount + 1}/${maxRetries}):`,
                    error
                )

                if (retryCount < maxRetries) {
                    console.log(`>>> 🔄 ${5000}ms 後重試連線...`)
                    await new Promise((resolve) => setTimeout(resolve, 5000))
                    await connectToDB(retryCount + 1, maxRetries)
                } else {
                    console.error(`>>> ❌ 已達最大重試次數 (${maxRetries})，無法連接到 MongoDB`)
                    // 可以在這裡處理無法連線的情況，例如傳送通知或優雅地關閉 Bot
                }
            }
        }

        await connectToDB()

        const dbHealthCheckInterval = setInterval(
            async () => {
                const healthStatus = await checkMongoDBHealth()
                if (healthStatus.status !== 'healthy') {
                    console.warn(
                        `>>> ⚠️ MongoDB 健康檢查失敗: ${healthStatus.details.readyStateDesc}`
                    )
                    if (healthStatus.details.error) {
                        console.error(`>>> ❌ 錯誤詳情: ${healthStatus.details.error}`)
                    }

                    if (
                        mongoose.connection.readyState !== 1 &&
                        mongoose.connection.readyState !== 2
                    ) {
                        console.log('>>> 🔄 嘗試重新連線至 MongoDB...')
                        connectToDB(0, 3)
                    }
                } else {
                    console.log(
                        `>>> ✅ MongoDB 健康檢查通過 (延遲: ${healthStatus.details.ping}ms)`
                    )
                }
            },
            30 * 60 * 1000
        )

        client.once('shutdown', () => {
            if (dbHealthCheckInterval) clearInterval(dbHealthCheckInterval)
        })

        mongoose.connection.on('error', (error) => {
            console.error('>>> ❌ MongoDB 連線錯誤:', error)
        })

        mongoose.connection.on('disconnected', () => {
            console.log('>>> 🔌 MongoDB 連線斷開，嘗試重新連線...')
            connectToDB()
        })

        if (client.user?.id === '869166906765103135') {
            const Embed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`${client.user} 上線了!`)
                .setTimestamp()

            const webhook = await client.fetchWebhook(
                '1265249137327214674',
                'JKxcMDXNaR0Y2Y-LVt-syEGHsGIrab97FdyliUTGFH_dNEGaXf8Ty7RXLeAGEvliT5IN'
            )
            await webhook.send({ embeds: [Embed] })
        }

        setInterval(() => updatePresence(client), 10 * 1000)

        setInterval(
            async () => {
                try {
                    if (mongoose.connection.readyState !== 1) {
                        console.warn('>>> ⚠️ MongoDB 連線未就緒，跳過定時任務...')
                        return
                    }

                    const giveaways = await Giveaway.find({
                        endAt: { $lt: new Date() },
                        ended: false
                    }).maxTimeMS(20000)

                    console.log(`>>> 🎉 找到 ${giveaways.length} 個需要結束的抽獎活動`)

                    for (const giveaway of giveaways) {
                        try {
                            await endGiveaway(giveaway.messageId, client)
                            console.log(`>>> ✅ 成功結束抽獎活動: ${giveaway.messageId}`)
                        } catch (error) {
                            console.error(
                                `>>> ❌ 結束抽獎活動時發生錯誤 (ID: ${giveaway.messageId}):`,
                                error
                            )

                            try {
                                await Giveaway.updateOne(
                                    { messageId: giveaway.messageId },
                                    { $set: { ended: true, hasError: true } }
                                )
                            } catch (dbError) {
                                console.error(`>>> ❌ 更新抽獎活動狀態失敗:`, dbError)
                            }
                        }
                    }

                    await checkAndNotify(client)

                    if (global.gc) {
                        global.gc()
                        console.log('>>> ✅ 已執行垃圾回收')
                    }
                } catch (mainError) {
                    console.error('>>> ❌ 定時任務執行時發生嚴重錯誤:', mainError)
                }
            },
            24 * 60 * 60 * 1000
        )
    }
} satisfies EventType

async function endGiveaway(messageId: string, client: Client): Promise<void> {
    const giveaway = await safeDbOperation(
        () => Giveaway.findOne({ messageId, ended: false }).maxTimeMS(10000),
        undefined
    )

    if (!giveaway) {
        console.log(`>>> ⚠️ 找不到未結束的抽獎活動: ${messageId}`)
        return
    }

    try {
        const channel = await client.channels.fetch(giveaway.channelId)
        if (!channel?.isTextBased()) {
            console.log(`>>> ⚠️ 找不到頻道或頻道不是文字頻道: ${giveaway.channelId}`)
            await safeDbOperation(() =>
                Giveaway.updateOne({ messageId }, { $set: { ended: true, hasError: true } })
            )
            return
        }

        const message = await channel.messages.fetch(giveaway.messageId)
        if (!message) {
            console.log(`>>> ⚠️ 找不到訊息: ${giveaway.messageId}`)
            await safeDbOperation(() =>
                Giveaway.updateOne({ messageId }, { $set: { ended: true, hasError: true } })
            )
            return
        }

        const winners = selectWinners(giveaway.participants, giveaway.winnerCount - 1)
        const winnerMentions = winners.map((id) => `<@${id}>`).join(', ') || '沒有人參加抽獎'

        if (message.embeds.length > 0) {
            const endEmbed = EmbedBuilder.from(message.embeds[0]!)
                .setColor('Green')
                .setDescription(
                    message.embeds[0]!.data.description!.split('\n\n')[0] +
                        `\n\n<:person:1265561455529562154> | 得獎者：${winnerMentions}`
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
            console.error('>>> ⚠️ 訊息中沒有嵌入內容')
            await safeDbOperation(() =>
                Giveaway.updateOne({ messageId }, { $set: { ended: true, hasError: true } })
            )
            return
        }

        giveaway.ended = true
        await safeDbOperation(() => giveaway.save())

        await safeDbOperation(async () => {
            const stats =
                (await GiveawayStats.findOne({ guildId: giveaway.guildId }).maxTimeMS(10000)) ||
                new GiveawayStats({ guildId: giveaway.guildId })

            stats.activeGiveaways--
            stats.totalWinners += winners.length

            for (const winnerId of winners) {
                const winHistory = await GiveawayHistory.countDocuments({
                    guildId: giveaway.guildId,
                    winners: winnerId
                }).maxTimeMS(10000)

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

        console.log(`>>> ✅ 成功結束抽獎活動: ${messageId}，有 ${winners.length} 個獲獎者`)
    } catch (error) {
        console.error(`>>> ❌ 處理抽獎活動時發生錯誤 (ID: ${messageId}):`, error)
        await safeDbOperation(() =>
            Giveaway.updateOne({ messageId }, { $set: { ended: true, hasError: true } })
        )
    }
}

function selectWinners(participants: string[], count: number): string[] {
    const shuffled = [...participants].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(count, participants.length))
}
