import Giveaway from '@/Structures/Schemas/Giveaway.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import emojis from '@/libs/emoji/emoji.js'
import { sendGiveawayNotification } from '@/libs/utils/sendGiveawayNotification.js'
import { ButtonInteraction, EmbedBuilder, MessageFlags, TextChannel } from 'discord.js'

export default {
    id: 'giveaway-reroll',
    async execute(interaction: ButtonInteraction, client: PaperClient) {
        const hosterId = interaction.customId.split('/')[1]

        if (interaction.user.id !== hosterId) {
            return interaction.reply({
                content: `${emojis.warning} | 只有抽獎主持人可以重新抽獎！`,
                flags: MessageFlags.Ephemeral
            })
        }

        const giveaway = await Giveaway.findOne({
            messageId: interaction.message.id,
            ended: true
        })

        if (!giveaway) {
            return interaction.reply({
                content: `${emojis.warning} | 找不到這個抽獎活動！`,
                flags: MessageFlags.Ephemeral
            })
        }

        if (giveaway.participants.length === 0) {
            return interaction.reply({
                content: `${emojis.warning} | 沒有人參加這個抽獎活動！`,
                flags: MessageFlags.Ephemeral
            })
        }

        const winners = await client.giveawaysManager.reroll(giveaway.messageId)
        const winnerMentions = winners?.map((id) => `<@${id}>`).join(', ')

        // 更新嵌入訊息
        const embed = EmbedBuilder.from(interaction.message.embeds[0]!)
        const currentDescription = embed.data.description ?? ''
        const resultLine = `🎯 得獎者：${winnerMentions || '無'}`
        const description = /得獎者：.+/.test(currentDescription)
            ? currentDescription.replace(/得獎者：.+/, resultLine)
            : currentDescription + `\n\n${resultLine}`
        embed.setDescription(description)

        await interaction.message.edit({ embeds: [embed] })

        await (interaction.channel! as TextChannel).send({
            content: `🎲 重新抽獎結果：\n恭喜 ${winnerMentions} 獲得 **${giveaway.prize}**！`,
            allowedMentions: { users: winners?.map((id) => id.toString()) }
        })

        // 發送私人通知給新的得獎者
        for (const winnerId of winners!) {
            await sendGiveawayNotification(
                client,
                'win',
                {
                    ...giveaway.toObject(),
                    endAt: giveaway.endAt.getTime()
                },
                winnerId
            )
        }

        return interaction.reply({
            content: `${emojis.correct} | 重新抽獎完成！`,
            flags: MessageFlags.Ephemeral
        })
    }
}
