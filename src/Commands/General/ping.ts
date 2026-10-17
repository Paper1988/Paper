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

        try {
            // Keep this as a direct reply: deferReply can leave the message in a
            // non-Components-V2 state, where Discord rejects a Container (type 17).
            await interaction.reply({
                components: [container],
                flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
            })
        } catch (error) {
            console.error('>>> ❌ 無法回覆 Ping 結果:', error)
        }
    },
}
