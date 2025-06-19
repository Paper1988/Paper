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

import { registerDistubeEvents } from '@/Events/Distube/DistubeEvents.js'
import { PaperClient } from '@/classes/PaperClient.js'
import { checkAndNotify } from '@/libs/utils/checkCookies.js'
import type { EventType } from '@/typings/event.js'

export default {
    name: Events.ClientReady,
    once: true,
    async execute(client: PaperClient) {
        await Promise.all([
            loadCommands(client),
            loadButtons(client),
            loadModals(client),
            loadMenus(client)
        ])

        // 註冊 DisTube 事件處理器
        registerDistubeEvents(client)

        try {
            await client.startFastify()
        } catch (error) {
            console.error('Failed to start Fastify server:', error)
        }

        mongoose.set('strictQuery', false)
        await mongoose.connect(process.env.DATABASE_URL!, {
            dbName: 'Js'
        })
        console.log(`>>> ✅ 成功連結到 MongoDB ${mongoose.connection.db!.databaseName}!`)

        if (client.user?.id === '***REMOVED***') {
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
                const giveaways = await Giveaway.find({
                    endAt: { $lt: new Date() },
                    ended: false
                })

                for (const giveaway of giveaways) {
                    try {
                        const channel = await client.channels.fetch(giveaway.channelId)
                        if (!channel?.isTextBased()) continue

                        const message = await channel.messages.fetch(giveaway.messageId)
                        if (!message) continue

                        await endGiveaway(message.id, client)
                    } catch (error) {
                        console.error('Error ending giveaway:', error)
                    }
                }

                await checkAndNotify(client)

                if (global.gc) {
                    global.gc()
                    console.log('✅ 已執行垃圾回收')
                }
            },
            24 * 60 * 60 * 1000
        )
    }
} satisfies EventType

async function endGiveaway(messageId: string, client: Client): Promise<void> {
    const giveaway = await Giveaway.findOne({ messageId, ended: false })
    if (!giveaway) return

    const channel = await client.channels.fetch(giveaway.channelId)
    if (!channel?.isTextBased()) return

    const message = await channel.messages.fetch(giveaway.messageId)
    if (!message) return

    const winners = selectWinners(giveaway.participants, giveaway.winners.length - 1)
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
        console.error('Message does not contain embeds')
    }

    giveaway.ended = true
    await giveaway.save()

    const stats =
        (await GiveawayStats.findOne({ guildId: giveaway.guildId })) ||
        new GiveawayStats({ guildId: giveaway.guildId })

    stats.activeGiveaways--
    stats.totalWinners += winners.length

    for (const winnerId of winners) {
        const winHistory = await GiveawayHistory.countDocuments({
            guildId: giveaway.guildId,
            winners: winnerId
        })

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
}

function selectWinners(participants: string[], count: number): string[] {
    const shuffled = [...participants].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(count, participants.length))
}
