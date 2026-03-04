import { cronJob } from '@/jobs/index.js'
import { Logger } from '@/libs/utils/logger.js'
import { PaperClient } from '@/Structures/classes/PaperClient.js'
import * as Sentry from '@sentry/node'
import { GatewayIntentBits, Partials } from 'discord.js'
import dotenv from 'dotenv'
import fs from 'fs'

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

try {
    cronJob.startJobs()
    Logger.info('已啟動排程')
} catch (error) {
    Logger.error('無法啟動排程', error)
}

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

export default client!
