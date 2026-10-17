import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import {
    ChatInputCommandInteraction,
    ContainerBuilder,
    MessageFlags,
    SlashCommandBuilder,
    TextDisplayBuilder,
} from 'discord.js'

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
            await interaction.deferReply({
                flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
            })

            const responseLatency = Date.now() - interaction.createdTimestamp
            const container = new ContainerBuilder()
                .setAccentColor(0xA3A3A3)
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        '# Connection status\n' +
                            'Paper · 連線狀態\n\n' +
                            `**回應延遲** · ${responseLatency} ms\n` +
                            `**Discord Gateway** · ${client.ws.ping} ms`,
                    ),
                )

            await interaction.editReply({ components: [container] })
        } catch (error) {
            console.error('>>> ❌ 無法回覆 Ping 結果:', error)
            try {
                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply({ content: '測量延遲時發生錯誤，請稍後再試。' })
                } else {
                    await interaction.reply({
                        content: '測量延遲時發生錯誤，請稍後再試。',
                        flags: MessageFlags.Ephemeral,
                    })
                }
            } catch (replyError) {
                console.error('>>> ❌ 無法回覆錯誤:', replyError)
            }
        }
    },
}
