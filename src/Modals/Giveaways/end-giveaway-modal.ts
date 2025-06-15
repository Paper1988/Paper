import type { PaperClient } from '@/classes/PaperClient'
import { MessageFlags, ModalSubmitInteraction, PermissionsBitField } from 'discord.js'
import Giveaway from '../../Structures/Schemas/Giveaway'

export default {
    id: 'end-giveaway-modal',
    async execute(interaction: ModalSubmitInteraction, client: PaperClient) {
        const giveawayId = interaction.fields.getTextInputValue('giveawayId')

        const giveaway = await Giveaway.findOne({
            messageId: giveawayId,
            guildId: interaction.guildId,
            ended: false
        })

        if (!giveaway) {
            return interaction.reply({
                content: '<:warning:1265562532857380936> | 找不到這個抽獎活動！',
                flags: MessageFlags.Ephemeral
            })
        }

        // 檢查是否為抽獎主持人
        if (
            giveaway.hostedBy !== interaction.user.id &&
            !interaction.memberPermissions!.has(PermissionsBitField.Flags.ManageGuild)
        ) {
            return interaction.reply({
                content: '<:warning:1265562532857380936> | 只有抽獎主持人或管理員可以結束抽獎！',
                flags: MessageFlags.Ephemeral
            })
        }

        try {
            // 使用 giveawaysManager 結束抽獎
            await client.giveawaysManager.end(giveawayId)

            return interaction.reply({
                content: '<:correct:1265560254708711467> | 抽獎活動已成功結束！',
                flags: MessageFlags.Ephemeral
            })
        } catch (error) {
            console.error('結束抽獎時發生錯誤:', error)
            return interaction.reply({
                content: '<:warning:1265562532857380936> | 結束抽獎時發生錯誤！',
                flags: MessageFlags.Ephemeral
            })
        }
    }
}
