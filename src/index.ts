import { PaperClient } from '@/classes/PaperClient.js'
import chalk from 'chalk'
import { Collection, GatewayIntentBits, Partials } from 'discord.js'

console.log(chalk.cyan('>>> 正在初始化機器人...'))
console.log(`>>> Node.js 版本: ${process.version}`)

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

    console.log(chalk.green('>>> 已建立 Discord Client 實例'))

    client.commands = new Collection()
    client.buttons = new Collection()
    client.events = new Collection()
    client.subCommands = new Collection()
    client.modals = new Collection()
    client.selectMenus = new Collection()
    client.contextMenus = new Collection()

    console.log(chalk.green('>>> 已初始化集合'))

    // 初始化 DisTube
    console.log(chalk.yellow('>>> 正在初始化 DisTube...'))
    client.initDistube()
    console.log(chalk.green('>>> DisTube 初始化完成'))

    console.log(chalk.yellow('>>> 正在啟動機器人...'))
    client.start({ Production: false })
    console.log(chalk.green('>>> 機器人啟動程序已開始'))

    // 捕獲主線程未捕獲的異常
    process.on('uncaughtException', (err) => {
        console.error(chalk.red('>>> [主線程] 未捕獲的錯誤:'), err)
    })

    process.on('unhandledRejection', (reason) => {
        console.error(chalk.red('>>> [主線程] 未處理的 Promise 拒絕:'), reason)
    })
} catch (error) {
    console.error(chalk.red('>>> [嚴重錯誤] 機器人啟動失敗:'), error)
    process.exit(1)
}

export default client!
