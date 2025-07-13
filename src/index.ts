import { PaperClient } from '@/classes/PaperClient.js'
import { Logger } from '@/libs/utils/logger.js'
import * as Sentry from '@sentry/node'
import { Collection, GatewayIntentBits, Partials } from 'discord.js'

Sentry.init({
    dsn: process.env.SENTRY_DNS,
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
