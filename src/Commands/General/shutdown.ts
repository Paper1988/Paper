import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    MessageFlags,
    SlashCommandBuilder,
} from 'discord.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { Logger } from '@/libs/utils/logger.js'
import * as Sentry from '@sentry/node'
import cron from 'node-cron'
import mongoose from 'mongoose'

const CONFIRM_ID = 'shutdown:confirm'
const CANCEL_ID = 'shutdown:cancel'
const CONFIRM_TIMEOUT_MS = 30_000

async function gracefulShutdown(client: PaperClient): Promise<void> {
    Logger.warn('收到開發者指令，開始安全關閉 Paper...')

    const cleanupTasks: Array<[string, () => Promise<unknown>]> = [
        [
            'Moonlink 音樂播放器',
            async () => {
                if (!client.moonlink) return
                for (const player of [...client.moonlink.players.all]) {
                    player.destroy('shutdown')
                }
            },
        ],
        ['API Server', () => client.stopApiServer()],
        ['MongoDB', () => mongoose.disconnect()],
        ['Sentry', () => Sentry.close(2_000)],
    ]

    for (const task of cron.getTasks().values()) {
        task.stop()
    }

    for (const [name, cleanup] of cleanupTasks) {
        try {
            await cleanup()
            Logger.info(`安全關閉完成：${name}`)
        } catch (error) {
            Logger.error(`安全關閉時無法完成 ${name} 清理：`, error as Error)
        }
    }

    try {
        client.destroy()
        Logger.info('Discord Gateway 已關閉，Paper 即將退出。')
    } catch (error) {
        Logger.error('關閉 Discord Gateway 時發生錯誤：', error as Error)
    }

    process.exit(0)
}

export default {
    developer: true,
    data: new SlashCommandBuilder()
        .setName('shutdown')
        .setNameLocalization('zh-TW', '安全關機')
        .setDescription('Safely shut down the Paper bot')
        .setDescriptionLocalization('zh-TW', '安全關閉 Paper Discord Bot'),
    async execute(interaction: ChatInputCommandInteraction, client: PaperClient) {
        const confirmation = new EmbedBuilder()
            .setColor(0xA3A3A3)
            .setTitle('安全關閉 Paper')
            .setDescription(
                '這會停止排程工作、關閉 API 伺服器與資料庫連線，並讓 Bot 正常退出。\n\n**確定要關閉嗎？**',
            )
            .setFooter({ text: '此操作會立即讓 Bot 離線。' })

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(CONFIRM_ID)
                .setLabel('確認關機')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId(CANCEL_ID)
                .setLabel('取消')
                .setStyle(ButtonStyle.Secondary),
        )

        await interaction.reply({
            embeds: [confirmation],
            components: [row],
            flags: MessageFlags.Ephemeral,
        })

        const reply = await interaction.fetchReply()
        const collector = reply.createMessageComponentCollector({
            time: CONFIRM_TIMEOUT_MS,
            filter: (buttonInteraction) => buttonInteraction.user.id === interaction.user.id,
            max: 1,
        })

        collector.on('collect', async (buttonInteraction) => {
            if (buttonInteraction.customId === CANCEL_ID) {
                await buttonInteraction.update({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xA3A3A3)
                            .setTitle('已取消關機')
                            .setDescription('Paper 會繼續正常運作。'),
                    ],
                    components: [],
                })
                return
            }

            if (buttonInteraction.customId !== CONFIRM_ID) return

            await buttonInteraction.update({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xA3A3A3)
                        .setTitle('正在安全關閉 Paper…')
                        .setDescription('正在停止排程並關閉服務與資料庫連線。'),
                ],
                components: [],
            })

            await gracefulShutdown(client)
        })

        collector.on('end', async (_collected, reason) => {
            if (reason !== 'time' || !interaction.isRepliable()) return

            try {
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xA3A3A3)
                            .setTitle('確認已逾時')
                            .setDescription('沒有執行關機，Paper 會繼續運作。'),
                    ],
                    components: [],
                })
            } catch {
                // The interaction may have expired or the message may have been deleted.
            }
        })
    },
}
