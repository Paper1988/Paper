import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    MessageFlags,
    SlashCommandBuilder,
} from 'discord.js'

const CONFIRM_TIMEOUT_MS = 30_000

export default {
    developer: true,
    data: new SlashCommandBuilder()
        .setName('shutdown')
        .setNameLocalization('zh-TW', '安全關機')
        .setDescription('Safely shut down the Paper bot')
        .setDescriptionLocalization('zh-TW', '安全關閉 Paper Discord Bot'),
    async execute(interaction: ChatInputCommandInteraction) {
        const confirmation = new EmbedBuilder()
            .setColor(0xA3A3A3)
            .setTitle('安全關閉 Paper')
            .setDescription(
                '這會停止排程工作、關閉 API 伺服器與資料庫連線，並讓 Bot 正常退出。\n\n**確定要關閉嗎？**',
            )
            .setFooter({ text: '此操作會立即讓 Bot 離線。' })

        const ownerId = interaction.user.id
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`shutdown:confirm:${ownerId}`)
                .setLabel('確認關機')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId(`shutdown:cancel:${ownerId}`)
                .setLabel('取消')
                .setStyle(ButtonStyle.Secondary),
        )

        await interaction.reply({
            embeds: [confirmation],
            components: [row],
            flags: MessageFlags.Ephemeral,
        })

        setTimeout(async () => {
            try {
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xA3A3A3)
                            .setTitle('確認已逾時')
                            .setDescription('沒有執行關機，Paper 會繼續運作。'),
                    ],
                    components: [
                        new ActionRowBuilder<ButtonBuilder>().addComponents(
                            new ButtonBuilder()
                                .setCustomId(`shutdown:confirm:${ownerId}`)
                                .setLabel('確認關機')
                                .setStyle(ButtonStyle.Danger)
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setCustomId(`shutdown:cancel:${ownerId}`)
                                .setLabel('取消')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true),
                        ),
                    ],
                })
            } catch {
                // The interaction may have expired or the message may have been deleted.
            }
        }, CONFIRM_TIMEOUT_MS).unref?.()
    },
}
