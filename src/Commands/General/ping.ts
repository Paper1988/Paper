import type { PaperClient } from '@/Structures/classes/PaperClient'
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setNameLocalization('zh-TW', 'ping')
        .setNameLocalization('ja', 'ピング')
        .setDescription('Pong!')
        .setDescriptionLocalization('zh-TW', 'pong!')
        .setDescriptionLocalization('ja', 'pong!'),
    async execute(interaction: ChatInputCommandInteraction, client: PaperClient) {
        try {
            const sent = await interaction.reply({
                content: '測量延遲中...',
                fetchReply: true,
                ephemeral: true
            })

            const pingTime = sent.createdTimestamp - interaction.createdTimestamp

            await interaction.editReply({
                content: `🏓 Pong!\n機器人延遲: ${pingTime}ms\nAPI 延遲: ${client.ws.ping}ms`
            })
        } catch (error) {
            try {
                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply({ content: '處理命令時發生錯誤。' })
                } else {
                    await interaction.reply({ content: '處理命令時發生錯誤。', ephemeral: true })
                }
            } catch (replyError) {
                console.error('>>> ❌ 無法回復錯誤:', replyError)
            }
        }
    }
}
