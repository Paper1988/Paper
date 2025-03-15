const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    MessageFlags,
    ChannelSelectMenuComponent,
    Client
} = require('discord.js')

module.exports = {
    id: 'giveaway-channel-select',
    /**
     *
     * @param {ChannelSelectMenuComponent} interaction
     * @param {Client} client
     * @returns
     */
    async execute(interaction, client) {
        const selectedChannelId = interaction.values[0]
        const channel = await client.channels.fetch(selectedChannelId)

        if (!channel) {
            return interaction.reply({
                content: '<:warning:1265562532857380936> | 找不到指定的頻道！',
                flags: MessageFlags.Ephemeral
            })
        }

        if (!channel.permissionsFor(interaction.member).has('SendMessages')) {
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
            new ActionRowBuilder().addComponents(prizeInput),
            new ActionRowBuilder().addComponents(durationInput),
            new ActionRowBuilder().addComponents(winnersInput),
            new ActionRowBuilder().addComponents(descriptionInput),
            new ActionRowBuilder().addComponents(requirementsInput)
        ]

        modal.addComponents(rows)
        await interaction.showModal(modal)
    }
}
