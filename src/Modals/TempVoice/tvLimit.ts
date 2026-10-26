import emojis from '@/libs/emoji/emoji.js'
import { getManagedChannel, refreshPanel } from '@/Systems/TempVoice.js'
import type { ModalType } from '@/typings/component.js'
import { MessageFlags, ModalSubmitInteraction } from 'discord.js'

export default {
    id: 'tvLimit',
    async execute(interaction: ModalSubmitInteraction) {
        const managed = await getManagedChannel(interaction)
        if (!managed) return
        const { channel, record } = managed

        const limit = Number(interaction.fields.getTextInputValue('limit'))
        if (!Number.isInteger(limit) || limit < 0 || limit > 99) {
            return await interaction.reply({
                content: `${emojis.warning} | 請輸入 0 到 99 的整數!`,
                flags: MessageFlags. Ephemeral
            })
        }

        await channel.setUserLimit(limit)
        await interaction.reply({
            content: `${emojis.correct} | 人數上限已設為 ${limit || '無限制'}`,
            flags: MessageFlags.Ephemeral
        })
        await refreshPanel(channel, record.OwnerID, record.PanelMessageID)
    }
} satisfies ModalType
