import { Logger } from '@/libs/utils/logger.js'
import { PaperClient } from '@/Structures/classes/PaperClient.js'
import * as Sentry from '@sentry/node'
import { GatewayIntentBits, Partials } from 'discord.js'
import dotenv from 'dotenv'
import fs from 'fs'
import mongoose from 'mongoose'

if (fs.existsSync('.env.local')) {
    dotenv.config({ path: '.env.local' })
} else {
    dotenv.config()
}

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV || 'dev'
})

Logger.info('正在初始化機器人...')
Logger.info(`Node.js 版本: ${process.version}`)

let client: PaperClient

try {
    client = new PaperClient({
        shards: 'auto',
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.GuildVoiceStates
        ],
        partials: [
            Partials.Channel,
            Partials.User,
            Partials.Message,
            Partials.GuildMember,
            Partials.ThreadMember
        ]
    })

    Logger.info('已建立 Discord Client 實例')

    Logger.info('正在啟動機器人...')
    await client.start()
    Logger.info('機器人啟動程序已開始')
} catch (error) {
    Logger.error('機器人啟動失敗:', error)
    process.exit(1)
}

import { cronJob } from '@/jobs/index.js'
try {
    cronJob.startJobs()
    Logger.info('已啟動排程')
} catch (error) {
    Logger.error('無法啟動排程', error)
}

let isShuttingDown = false

const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    if (isShuttingDown) return
    isShuttingDown = true
    Logger.info(`收到 ${signal}，正在安全關閉 Paper...`)

    client.emit('shutdown')

    try {
        await client.stopApiServer()
        await client.destroy()
        await mongoose.disconnect()
        Logger.info('Paper 已安全關閉')
        process.exit(0)
    } catch (error) {
        Logger.error('安全關閉 Paper 時發生錯誤:', error)
        process.exit(1)
    }
}

process.once('SIGINT', () => void shutdown('SIGINT'))
process.once('SIGTERM', () => void shutdown('SIGTERM'))

export default client!
