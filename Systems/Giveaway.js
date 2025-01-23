const giveawayModel = require('../Structures/Schemas/Giveaway')
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const { sendGiveawayNotification } = require('../Functions/sendGiveawayNotification')
const GiveawayStats = require('../Structures/Schemas/GiveawayStats')
const GiveawayHistory = require('../Structures/Schemas/GiveawayHistory')

module.exports = (client) => {
    class GiveawayManagerWithOwnDatabase {
        constructor(client) {
            this.client = client
            this.giveaways = new Map()
            this.init()
        }

        async init() {
            const giveaways = await giveawayModel.find({ ended: false })
            for (const giveaway of giveaways) {
                this.giveaways.set(giveaway.messageId, giveaway)
                if (giveaway.endAt > Date.now()) {
                    this.scheduleEnd(giveaway.messageId, giveaway.endAt - Date.now())
                }
            }
        }

        scheduleEnd(messageId, delay) {
            setTimeout(() => this.end(messageId), delay)
        }

        async saveGiveaway(messageId, giveawayData) {
            const giveaway = await giveawayModel.create(giveawayData)
            this.giveaways.set(messageId, giveaway)

            // 發送開始通知
            const guild = await this.client.guilds.fetch(giveawayData.guildId)
            const members = await guild.members.fetch()
            for (const [userId, member] of members) {
                await sendGiveawayNotification(this.client, 'start', giveawayData, userId)
            }

            return true
        }

        async editGiveaway(messageId, giveawayData) {
            await giveawayModel.updateOne({ messageId }, giveawayData)
            const updated = await giveawayModel.findOne({ messageId })
            if (updated) this.giveaways.set(messageId, updated)
            return true
        }

        async deleteGiveaway(messageId) {
            await giveawayModel.deleteOne({ messageId })
            this.giveaways.delete(messageId)
            return true
        }

        async end(messageId) {
            const giveaway = await giveawayModel.findOne({ messageId, ended: false })
            if (!giveaway) return null

            // 選擇得獎者
            const winners = this.selectWinners(giveaway.participants, giveaway.winnerCount)
            const winnerMentions = winners.map((id) => `<@${id}>`).join(', ') || '沒有人參加抽獎'

            const channel = await this.client.channels.fetch(giveaway.channelId)
            if (!channel) return null

            const message = await channel.messages.fetch(giveaway.messageId)
            if (!message) return null

            // 更新嵌入訊息
            const endEmbed = EmbedBuilder.from(message.embeds[0])
                .setColor('Green')
                .setDescription(
                    message.embeds[0].data.description.split('\n\n')[0] +
                        `\n\n🎯 得獎者：${winnerMentions}`
                )

            // 更新按鈕
            const endButtons = new ActionRowBuilder().addComponents(
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

            // 先發送中獎通知給得獎者
            for (const winnerId of winners) {
                await sendGiveawayNotification(this.client, 'win', giveaway, winnerId)
            }

            // 只發送結束通知給非得獎者
            for (const userId of giveaway.participants) {
                if (!winners.includes(userId)) {
                    await sendGiveawayNotification(this.client, 'end', giveaway, userId)
                }
            }

            // 更新資料庫
            giveaway.ended = true
            giveaway.winners = winners
            await giveaway.save()
            this.giveaways.set(messageId, giveaway)

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
                const winnerStats = await GiveawayHistory.aggregate([
                    {
                        $match: {
                            guildId: giveaway.guildId
                        }
                    },
                    {
                        $unwind: '$winners'
                    },
                    {
                        $group: {
                            _id: '$winners',
                            winCount: { $sum: 1 }
                        }
                    },
                    {
                        $sort: { winCount: -1 }
                    },
                    {
                        $limit: 1
                    }
                ])

                if (winnerStats.length > 0) {
                    stats.mostWonUser = {
                        userId: winnerStats[0]._id,
                        count: winnerStats[0].winCount
                    }
                }

                await stats.save()
            }
        }

        selectWinners(participants, count) {
            const shuffled = [...participants].sort(() => Math.random() - 0.5)
            return shuffled.slice(0, Math.min(count, participants.length))
        }

        async reroll(messageId) {
            const giveaway = await giveawayModel.findOne({ messageId, ended: true })
            if (!giveaway) return null

            const winners = this.selectWinners(giveaway.participants, giveaway.winnerCount)
            giveaway.winners = winners
            await giveaway.save()

            return winners
        }
    }

    client.giveawaysManager = new GiveawayManagerWithOwnDatabase(client)
}
