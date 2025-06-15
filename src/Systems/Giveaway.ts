import type { FetchGuildOptions } from 'discord.js'

import { PaperClient } from '@/classes/PaperClient'
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    type MessageActionRowComponentBuilder
} from 'discord.js'
import { sendGiveawayNotification } from '../libs/utils/sendGiveawayNotification'
import giveawayModel from '../Structures/Schemas/Giveaway'
import GiveawayHistory from '../Structures/Schemas/GiveawayHistory'
import GiveawayNotification from '../Structures/Schemas/GiveawayNotification'
import GiveawayStats from '../Structures/Schemas/GiveawayStats'

class GiveawayManagerWithOwnDatabase {
    private client: PaperClient
    private giveaways: Map<string, any>
    private cleanupInterval: NodeJS.Timeout | null = null

    constructor(client: PaperClient) {
        this.client = client
        this.giveaways = new Map()
        this.init()
        this.startCleanupInterval()
    }

    async init() {
        const giveaways = await giveawayModel.find({ ended: false })
        for (const giveaway of giveaways) {
            this.giveaways.set(giveaway.messageId, giveaway)
            if (giveaway.endAt.getTime() > Date.now()) {
                this.scheduleEnd(giveaway.messageId, giveaway.endAt.getTime() - Date.now())
            }
        }

        // 初始化時也執行一次清理
        await this.cleanupOldGiveaways()
    }

    scheduleEnd(messageId: string, delay: number) {
        if (delay <= 0) {
            return this.end(messageId)
        }
        setTimeout(() => this.end(messageId), Math.min(delay, 2 ** 31 - 1)) // 確保不超過 2147483647ms
    }

    async saveGiveaway(
        messageId: string,
        giveawayData: {
            guildId: string | FetchGuildOptions
            prize: string
            endAt: number
            channelId: string
            messageId: string
            winners: string[]
        }
    ) {
        const giveaway = await giveawayModel.create(giveawayData)
        this.giveaways.set(messageId, giveaway)

        // 建議改為只發送給有開啟通知的用戶
        const guild = await this.client.guilds.fetch(giveawayData.guildId)
        const members = await guild.members.fetch()

        // 將所有非機器人用戶創建至通知的資料庫
        const nonBotMembers = members.filter((member) => !member.user.bot)
        for (const [userId, member] of nonBotMembers) {
            new GiveawayNotification({
                guildId: guild.id,
                userId: userId
            })
        }

        // 發送通知給參加者
        for (const [userId, member] of nonBotMembers) {
            await sendGiveawayNotification(this.client, 'start', giveawayData, userId)
        }

        return true
    }

    async editGiveaway(messageId: string, giveawayData: { guildId: string | FetchGuildOptions }) {
        await giveawayModel.updateOne({ messageId }, giveawayData)
        const updated = await giveawayModel.findOne({ messageId })
        if (updated) this.giveaways.set(messageId, updated)
        return true
    }

    async deleteGiveaway(messageId: string) {
        await giveawayModel.deleteOne({ messageId })
        this.giveaways.delete(messageId)
        return true
    }

    async end(messageId: string) {
        const giveaway = await giveawayModel.findOne({ messageId, ended: false })
        if (!giveaway) return null

        const channel = await this.client.channels.fetch(giveaway.channelId)
        if (!channel?.isTextBased()) return null

        const message = await channel.messages.fetch(giveaway.messageId)
        if (!message) return null

        // 選擇得獎者
        const winners = this.selectWinners(giveaway.participants, giveaway.winnerCount)
        const winnerMentions = winners.map((id) => `<@${id}>`).join(', ') || '沒有人參加抽獎'

        // 更新嵌入訊息
        const endEmbed = EmbedBuilder.from(message.embeds[0]!)
            .setColor('Green')
            .setDescription(
                message.embeds[0]!.data.description!.split('\n\n')[0] +
                    `\n\n🎯 得獎者：${winnerMentions}`
            )

        // 更新按鈕
        const endButtons = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
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

        // 更新資料庫
        giveaway.ended = true
        giveaway.winners = winners
        await giveaway.save()
        this.giveaways.set(messageId, giveaway)

        // 先發送中獎通知給得獎者
        for (const winnerId of winners) {
            await sendGiveawayNotification(
                this.client,
                'win',
                {
                    ...giveaway.toObject(),
                    endAt: giveaway.endAt.getTime()
                },
                winnerId
            )
        }

        // 只發送結束通知給非得獎者
        for (const userId of giveaway.participants) {
            if (!winners.includes(userId)) {
                await sendGiveawayNotification(
                    this.client,
                    'end',
                    {
                        ...giveaway.toObject(),
                        endAt: giveaway.endAt.getTime()
                    },
                    userId
                )
            }
        }

        // 更新統計
        let stats = await GiveawayStats.findOne({ guildId: giveaway.guildId })
        if (stats) {
            stats.activeGiveaways--
            stats.totalParticipants += giveaway.participants.length
            stats.totalWinners += winners.length

            // 創建抽獎歷史記錄
            await GiveawayHistory.create({
                guildId: giveaway.guildId,
                giveawayId: giveaway.messageId,
                prize: giveaway.prize,
                hosterId: giveaway.hostedBy,
                winners: winners,
                participantCount: giveaway.participants.length,
                endTime: new Date(),
                requirements: {
                    roles: giveaway.requiredRoles,
                    minAccountAge: giveaway.minAccountAge,
                    minServerTime: giveaway.minServerTime
                }
            })

            // 更新最幸運用戶
            for (const winnerId of winners) {
                const winHistory = await GiveawayHistory.countDocuments({
                    guildId: giveaway.guildId,
                    winners: winnerId
                })

                if (!stats.mostWonUser || winHistory > stats?.mostWonUser?.count!) {
                    stats.mostWonUser = {
                        userId: winnerId,
                        count: winHistory
                    }
                }
            }

            await stats.save()
        }

        return winners
    }

    selectWinners(participants: string | any[], count: number) {
        const shuffled = [...participants].sort(() => Math.random() - 0.5)
        return shuffled.slice(0, Math.min(count, participants.length))
    }

    async reroll(messageId: any) {
        const giveaway = await giveawayModel.findOne({ messageId, ended: true })
        if (!giveaway) return null

        const winners = this.selectWinners(giveaway.participants, giveaway.winnerCount)
        giveaway.winners = winners
        await giveaway.save()

        return winners
    }

    async cleanupOldGiveaways() {
        try {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

            const giveawaysToDelete = await giveawayModel.find({
                createdAt: { $lt: thirtyDaysAgo },
                ended: true // 只刪除已結束的抽獎
            })

            // 記錄要刪除的資料
            console.log('準備清理以下抽獎資料:')
            giveawaysToDelete.forEach(
                (giveaway: { messageId: any; prize: any; createdAt: any }) => {
                    console.log(
                        `- 抽獎ID: ${giveaway.messageId}, 獎品: ${giveaway.prize}, 創建時間: ${giveaway.createdAt}`
                    )
                }
            )

            // 執行刪除
            const deletedGiveaways = await giveawayModel.deleteMany({
                _id: { $in: giveawaysToDelete.map((g: { _id: any }) => g._id) }
            })

            console.log(`已清理 ${deletedGiveaways.deletedCount} 個已結束的舊抽獎資料`)

            // 如果刪除數量與預期不符，記錄警告
            if (deletedGiveaways.deletedCount !== giveawaysToDelete.length) {
                console.warn('警告：清理的資料數量與預期不符，請檢查資料庫')
            }
        } catch (error) {
            console.error('清理舊抽獎資料時發生錯誤:', error)
        }
    }

    startCleanupInterval() {
        // 每24小時執行一次
        this.cleanupInterval = setInterval(() => this.cleanupOldGiveaways(), 24 * 60 * 60 * 1000)
        process.on('SIGINT', () => {
            if (this.cleanupInterval) clearInterval(this.cleanupInterval)
        })
        this.client.on('destroy', () => {
            if (this.cleanupInterval) clearInterval(this.cleanupInterval)
        })
    }
}

declare module 'discord.js' {
    interface Client {
        giveawaysManager: GiveawayManagerWithOwnDatabase
    }
}

export default (client: PaperClient) => {
    client.giveawaysManager = new GiveawayManagerWithOwnDatabase(client)
}
