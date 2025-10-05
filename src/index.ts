import { PaperClient } from '@/classes/PaperClient.js'
import { Logger } from '@/libs/utils/logger.js'
import * as Sentry from '@sentry/node'
import { Collection, GatewayIntentBits, Partials } from 'discord.js'
import dotenv from 'dotenv'
import fs from 'fs'
import Cronitor from 'cronitor'
import cron from 'node-cron'
import { aggregateWeeklyStats } from '@/jobs/weeklyAggregation.js'

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

const cronitor = Cronitor(process.env.CRONITOR_API_KEY!)

await cronitor.Monitor.put({
    type: 'job',
    key: 'aggregateWeeklyStats',
    schedule: '0 0 * * *'
})

cronitor.wrap('q1eIdH', async (): Promise<void> => {
    await aggregateWeeklyStats()
})

cron.schedule(
    '0 0 * * 1',
    async () => {
        console.log('開始每週統計...')
        try {
            await aggregateWeeklyStats()
            console.log('每週統計完成')
        } catch (err) {
            console.error('每週統計失敗', err)
        }
    },
    {
        timezone: 'Asia/Taipei' // 設定為台北時區
    }
)

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

    client.commands = new Collection()
    client.buttons = new Collection()
    client.events = new Collection()
    client.subCommands = new Collection()
    client.modals = new Collection()
    client.selectMenus = new Collection()
    client.contextMenus = new Collection()

    Logger.info('已建立 Discord Client 實例')

    client.initDistube()
    Logger.info('DisTube 初始化完成')

    Logger.info('正在啟動機器人...')
    client.start()
    Logger.info('機器人啟動程序已開始')
} catch (error) {
    Logger.error('機器人啟動失敗:', error)
    process.exit(1)
}

export default client!
