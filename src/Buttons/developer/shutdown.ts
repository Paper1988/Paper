import { ButtonInteraction, EmbedBuilder } from 'discord.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { Logger } from '@/libs/utils/logger.js'
import * as Sentry from '@sentry/node'
import cron from 'node-cron'
import mongoose from 'mongoose'

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
    id: 'shutdown',
    async execute(
        interaction: ButtonInteraction,
        client: PaperClient,
        args: string[] = [],
    ) {
        const [action, ownerId] = args

        if (!ownerId || interaction.user.id !== ownerId) {
            await interaction.reply({
                content: '這組關機確認按鈕不屬於你。',
                ephemeral: true,
            })
            return
        }

        if (action === 'cancel') {
            await interaction.update({
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

        if (action !== 'confirm') {
            await interaction.reply({
                content: '無效的關機操作。',
                ephemeral: true,
            })
            return
        }

        await interaction.update({
            embeds: [
                new EmbedBuilder()
                    .setColor(0xA3A3A3)
                    .setTitle('正在安全關閉 Paper…')
                    .setDescription('正在停止排程並關閉服務與資料庫連線。'),
            ],
            components: [],
        })

        await gracefulShutdown(client)
    },
}
