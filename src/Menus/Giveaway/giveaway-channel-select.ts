import type { PaperClient } from '@/classes/PaperClient.js'
import type { MenuType } from '@/typings/component.js'
import {
    ActionRowBuilder,
    GuildMember,
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
        const channel = await client.channels.fetch(selectedChannelId!)

        if (!('channels' in interaction)) return

        if (!channel) {
            return interaction.reply({
                content: '<:warning:1265562532857380936> | 找不到指定的頻道！',
                flags: MessageFlags.Ephemeral
            })
        }

        if (
            !interaction.member ||
            !(interaction.member instanceof GuildMember) ||
            !(channel instanceof TextChannel) ||
            !(channel satisfies TextChannel)
                .permissionsFor(interaction.member satisfies GuildMember)
                .has('SendMessages')
        ) {
            return interaction.reply({
                content: '<:warning:1265562532857380936> | 你沒有權限在該頻道發送訊息！',
                flags: MessageFlags.Ephemeral
            })
        }

        const modal = new ModalBuilder()
            .setCustomId(`giveaway-modal/${selectedChannelId}`)
            .setTitle('創建抽獎')

        const prizeInput = new TextInputBuilder()
            .setCustomId('prize')
            .setLabel('獎品名稱')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder('例如：Nitro、Steam遊戲')

        const durationInput = new TextInputBuilder()
            .setCustomId('duration')
            .setLabel('持續時間（分鐘）')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder('輸入數字，例如：60')

        const winnersInput = new TextInputBuilder()
            .setCustomId('winners')
            .setLabel('得獎人數')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder('輸入數字，例如：1')

        const descriptionInput = new TextInputBuilder()
            .setCustomId('description')
            .setLabel('描述（選填）')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
            .setPlaceholder('輸入抽獎的詳細說明')

        const requirementsInput = new TextInputBuilder()
            .setCustomId('requirements')
            .setLabel('參加要求（選填）')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
            .setPlaceholder(
                '格式：\nrole:[身分組ID], blacklist:[身分組ID]\nage:[天數], server:[天數]'
            )

        const rows = [
            new ActionRowBuilder<TextInputBuilder>().addComponents(prizeInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(durationInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(winnersInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(requirementsInput)
        ]

        modal.addComponents(...rows)
        await interaction.showModal(modal)
    }
} satisfies MenuType
