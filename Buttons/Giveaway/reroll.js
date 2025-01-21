const { EmbedBuilder } = require('discord.js')
const Giveaway = require('../../Structures/Schemas/Giveaway')
const { sendGiveawayNotification } = require('../../Systems/sendGiveawayNotification')

module.exports = {
    id: 'giveaway-reroll',
    async execute(interaction, client) {
        const hosterId = interaction.customId.split('/')[1]

        if (interaction.user.id !== hosterId) {
            return interaction.reply({
                content: '<:warning:1265562532857380936> | 只有抽獎主持人可以重新抽獎！',
                ephemeral: true
            })
        }

        const giveaway = await Giveaway.findOne({
            messageId: interaction.message.id,
            ended: true
        })

        if (!giveaway) {
            return interaction.reply({
                content: '<:warning:1265562532857380936> | 找不到這個抽獎活動！',
                ephemeral: true
            })
        }

        if (giveaway.participants.length === 0) {
            return interaction.reply({
                content: '<:warning:1265562532857380936> | 沒有人參加這個抽獎活動！',
                ephemeral: true
            })
        }

        const winners = await client.giveawaysManager.reroll(giveaway.messageId)
        const winnerMentions = winners.map((id) => `<@${id}>`).join(', ')

        // 更新嵌入訊息
        const embed = EmbedBuilder.from(interaction.message.embeds[0])
        const description = embed.data.description.replace(
            /🎯 得獎者：.+/,
            `🎯 得獎者：${winnerMentions}`
        )
        embed.setDescription(description)

        await interaction.message.edit({ embeds: [embed] })

        await interaction.channel.send({
            content: `🎲 重新抽獎結果：\n恭喜 ${winnerMentions} 獲得 **${giveaway.prize}**！`,
            allowedMentions: { users: winners }
        })

        // 發送私人通知給新的得獎者
        for (const winnerId of winners) {
            await sendGiveawayNotification(client, 'win', giveaway, winnerId)
        }

        return interaction.reply({
            content: '<:correct:1265560254708711467> | 重新抽獎完成！',
            ephemeral: true
        })
    }
}

function selectWinners(participants, count) {
    const shuffled = [...participants].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(count, participants.length))
}
