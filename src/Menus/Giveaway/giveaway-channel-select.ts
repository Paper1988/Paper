import emojis from '@/libs/emoji/emoji.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import type { MenuType } from '@/typings/component.js'
import {
    ActionRowBuilder,
    ComponentBuilder,
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
        const channel = await client.channels.fetch(selectedChannelId!)

        if (!('channels' in interaction)) return

        if (!channel) {
            return interaction.reply({
                content: `${emojis.warning} | 找不到指定的頻道！`,
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
                content: `${emojis.warning} | 你沒有權限在該頻道發送訊息！`,
                flags: MessageFlags.Ephemeral
            })
        }

        const modal = new ModalBuilder()
            .setCustomId(`giveaway-modal/${selectedChannelId}`)
            .setTitle('創建抽獎')

        const prizeInput = new TextInputBuilder({
            customId: 'prize',
            style: TextInputStyle.Short,
            required: true,
            placeholder: '例如：Nitro、Steam遊戲'
        })

        const durationInput = new TextInputBuilder({
            customId: 'duration',
            style: TextInputStyle.Short,
            required: true,
            placeholder: '輸入數字，例如：60'
        })

        const winnersInput = new TextInputBuilder({
            customId: 'winners',
            style: TextInputStyle.Short,
            required: true,
            placeholder: '輸入數字，例如：1'
        })

        const descriptionInput = new TextInputBuilder({
            customId: 'description',
            style: TextInputStyle.Paragraph,
            required: false,
            placeholder: '輸入抽獎的詳細說明'
        })

        const requirementsInput = new TextInputBuilder({
            customId: 'requirements',
            style: TextInputStyle.Paragraph,
            required: false,
            placeholder: '格式：\nrole:[身分組ID], blacklist:[身分組ID]\nage:[天數], server:[天數]'
        })

        const prizeLabel = new LabelBuilder().setLabel('獎品名稱').setTextInputComponent(prizeInput)
        const durationLabel = new LabelBuilder()
            .setLabel('持續時間（分鐘）')
            .setTextInputComponent(durationInput)
        const winnersLabel = new LabelBuilder()
            .setLabel('得獎人數')
            .setTextInputComponent(winnersInput)
        const descriptionLabel = new LabelBuilder()
            .setLabel('描述（選填）')
            .setTextInputComponent(descriptionInput)
        const requirementsLabel = new LabelBuilder()
            .setLabel('參加要求（選填）')
            .setTextInputComponent(requirementsInput)

        modal.addLabelComponents([
            prizeLabel,
            durationLabel,
            winnersLabel,
            descriptionLabel,
            requirementsLabel
        ])

        await interaction.showModal(modal)
    }
} satisfies MenuType
