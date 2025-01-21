const { Client, EmbedBuilder } = require('discord.js')
const mongoose = require('mongoose')

const { loadCommands } = require('../../Structures/Handlers/commandHandler.js')
const { loadButtons } = require('../../Structures/Handlers/buttonHandler.js')
const { loadModals } = require('../../Structures/Handlers/modalHandler.js')
const { loadMenus } = require('../../Structures/Handlers/menuHandler.js')
const { updatePresence } = require('../../Systems/updatePresence.js')

const Giveaway = require('../../Structures/Schemas/Giveaway')
const GiveawayStats = require('../../Structures/Schemas/GiveawayStats')
const GiveawayHistory = require('../../Structures/Schemas/GiveawayHistory')

module.exports = {
    name: 'ready',
    once: true,
    /**
     * @param {Client} client
     */
    async execute(client) {
        loadCommands(client)
        loadButtons(client)
        loadModals(client)
        loadMenus(client)

        require('../../Page/app.js')

        mongoose.set('strictQuery', false)
        await mongoose
            .connect(client.config.Database)
            .then(() => console.log('>>> ✅ 成功連結到 MongoDB!'))

        const Embed = new EmbedBuilder()
            .setColor('Green')
            .setDescription(`<:online:1265561305209638912> ${client.user} 上線了!`)
            .setTimestamp()

        await client
            .fetchWebhook(
                '1265249137327214674',
                'JKxcMDXNaR0Y2Y-LVt-syEGHsGIrab97FdyliUTGFH_dNEGaXf8Ty7RXLeAGEvliT5IN'
            )
            .then((webhook) => webhook.send({ embeds: [Embed] }))

        setInterval(async () => await updatePresence(client), 10 * 1000)

        setInterval(async () => {
            const giveaways = await Giveaway.find({
                endTime: { $lt: new Date() },
                ended: false
            })

            for (const giveaway of giveaways) {
                try {
                    const channel = await client.channels.fetch(giveaway.channelId)
                    if (channel) {
                        const message = await channel.messages.fetch(giveaway.messageId)
                        if (message) {
                            await endGiveaway(message.id, client)
                        }
                    }
                } catch (error) {
                    console.error('Error ending giveaway:', error)
                }
            }
        }, 30000) // 每30秒檢查一次
    }
}

async function endGiveaway(messageId, client) {
    const giveaway = await Giveaway.findOne({ messageId, ended: false })
    if (!giveaway) return

    const channel = await client.channels.fetch(giveaway.channelId)
    if (!channel) return

    const message = await channel.messages.fetch(giveaway.messageId)
    if (!message) return

    const winners = selectWinners(giveaway.participants, giveaway.winners)
    const winnerMentions = winners.map((id) => `<@${id}>`).join(', ') || '沒有人參加抽獎'

    const endEmbed = EmbedBuilder.from(message.embeds[0])
        .setColor('Green')
        .setDescription(
            message.embeds[0].data.description.split('\n\n')[0] +
                `\n\n<:person:1265561455529562154> | 得獎者：${winnerMentions}`
        )

    const endButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('giveaway-join')
            .setLabel('抽獎已結束')
            .setEmoji('<:wave:1320296301862191104>')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
        new ButtonBuilder()
            .setCustomId(`giveaway-reroll/${giveaway.hosterId}`)
            .setLabel('重新抽獎')
            .setEmoji('🎲')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(false)
    )

    await message.edit({
        embeds: [endEmbed],
        components: [endButtons]
    })

    if (winners.length > 0) {
        await channel.send({
            content: `<:tada:1265562251981750272> 抽獎結束！\n恭喜 ${winnerMentions} 獲得 **${giveaway.prize}**！`,
            allowedMentions: { users: winners }
        })
    }

    giveaway.ended = true
    await giveaway.save()

    // 更新統計
    const stats =
        (await GiveawayStats.findOne({ guildId: giveaway.guildId })) ||
        new GiveawayStats({ guildId: giveaway.guildId })

    stats.activeGiveaways--
    stats.totalWinners += winners.length

    // 更新最幸運用戶
    for (const winnerId of winners) {
        const winHistory = await GiveawayHistory.countDocuments({
            guildId: giveaway.guildId,
            winners: winnerId
        })

        if (!stats.mostWonUser || winHistory > stats.mostWonUser.count) {
            stats.mostWonUser = {
                userId: winnerId,
                count: winHistory
            }
        }
    }

    await stats.save()

    // 添加到歷史記錄
    const history = new GiveawayHistory({
        guildId: giveaway.guildId,
        giveawayId: giveaway.messageId,
        prize: giveaway.prize,
        hosterId: giveaway.hosterId,
        winners,
        participantCount: giveaway.participants.length,
        endTime: giveaway.endTime,
        requirements: {
            roles: giveaway.requiredRoles,
            minAccountAge: giveaway.minAccountAge,
            minServerTime: giveaway.minServerTime
        }
    })

    await history.save()
}

function selectWinners(participants, count) {
    const shuffled = [...participants].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(count, participants.length))
}
