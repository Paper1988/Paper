import emojis from '@/libs/emoji/emoji.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import type { MenuType } from '@/typings/component.js'
import {
    GuildMember,
    LabelBuilder,
    MessageFlags,
    ModalBuilder,
    TextChannel,
    TextInputBuilder,
    TextInputStyle,
    type AnySelectMenuInteraction
} from 'discord.js'

export default {
    id: 'giveaway-channel-select',
    async execute(interaction: AnySelectMenuInteraction, client: PaperClient) {
        const selectedChannelId = interaction.values[0]
        if (!selectedChannelId) {
            return interaction.reply({
                content: `${emojis.warning} | 請先選擇要發布抽獎的頻道。`,
                flags: MessageFlags.Ephemeral
            })
        }

        const channel = await client.channels.fetch(selectedChannelId)
        if (
            !channel ||
            !(interaction.member instanceof GuildMember) ||
            !(channel instanceof TextChannel) ||
            !channel.permissionsFor(interaction.member).has('SendMessages')
        ) {
            return interaction.reply({
                content: `${emojis.warning} | 找不到頻道，或你沒有在該頻道發送訊息的權限。`,
                flags: MessageFlags.Ephemeral
            })
        }

        const modal = new ModalBuilder()
            .setCustomId(`giveaway-modal/${selectedChannelId}`)
            .setTitle('建立抽獎活動')

        const prizeInput = new TextInputBuilder()
            .setCustomId('prize')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(100)
            .setPlaceholder('例如：Discord Nitro、Steam 遊戲')

        const durationInput = new TextInputBuilder()
            .setCustomId('duration')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(6)
            .setPlaceholder('分鐘，例如：60')

        const winnersInput = new TextInputBuilder()
            .setCustomId('winners')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(3)
            .setPlaceholder('正整數，例如：1')

        const descriptionInput = new TextInputBuilder()
            .setCustomId('description')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
            .setMaxLength(1000)
            .setPlaceholder('補充獎品資訊或活動說明')

        const requirementsInput = new TextInputBuilder()
            .setCustomId('requirements')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
            .setMaxLength(500)
            .setPlaceholder(
                '每行一項，例如：\nrole: 123456789012345678\nblacklist: 234567890123456789\nage: 7\nserver: 3'
            )

        modal.addLabelComponents(
            new LabelBuilder().setLabel('獎品名稱').setTextInputComponent(prizeInput),
            new LabelBuilder().setLabel('活動時間（分鐘）').setTextInputComponent(durationInput),
            new LabelBuilder().setLabel('得獎人數').setTextInputComponent(winnersInput),
            new LabelBuilder().setLabel('活動說明（選填）').setTextInputComponent(descriptionInput),
            new LabelBuilder().setLabel('參加條件（選填）').setTextInputComponent(requirementsInput)
        )

        await interaction.showModal(modal)
    }
} satisfies MenuType
