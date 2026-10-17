import { loadEvents } from '@/Structures/Handlers/eventHandler.js'
import Giveaway from '@/Systems/Giveaway.js'
import { ApiServer } from '@/api/index.js'
import { Logger } from '@/libs/utils/logger.js'
import type { CommandType } from '@/typings/command.js'
import type { ButtonType, MenuType, ModalType } from '@/typings/component.js'
import type { EventExecute } from '@/typings/event.js'
import type { ClientOptions } from 'discord.js'
import { Client, Collection, WebhookClient } from 'discord.js'
import { Connectors, Manager } from 'moonlink.js'

export class PaperClient extends Client {
    commands: Collection<string, CommandType> = new Collection<string, CommandType>()
    override events: Collection<string, EventExecute> = new Collection<string, EventExecute>()
    buttons: Collection<string, ButtonType> = new Collection<string, ButtonType>()
    subCommands = new Collection<string, any>()
    modals: Collection<string, ModalType> = new Collection<string, ModalType>()
    selectMenus: Collection<string, MenuType> = new Collection<string, MenuType>()
    contextMenus = new Collection<string, any>()
    private errorWebhook: WebhookClient | null = null
    private apiServer: ApiServer | null = null
    moonlink?: Manager

    constructor(options: ClientOptions) {
        super(options)
        this.setMaxListeners(50)
        Giveaway(this)
        this.initErrorHandling()
        this.initMoonlink()
        loadEvents(this)
    }

    private initMoonlink() {
        // 驗證必要的環境變數
        const requiredEnvVars = ['NODELINK_HOST', 'NODELINK_PORT', 'NODELINK_PASSWORD']
        const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

        if (missingVars.length > 0) {
            Logger.warn(
                `缺少 Moonlink 環境變數: ${missingVars.join(', ')}。Moonlink 功能將被禁用。`
            )
            return
        }

        try {
            this.moonlink = new Manager({
                nodes: [
                    {
                        host: process.env.NODELINK_HOST!,
                        port: Number(process.env.NODELINK_PORT!),
                        password: process.env.NODELINK_PASSWORD!,
                        secure: true,
                        identifier: 'Main Node'
                    }
                ],
                options: {
                    clientName: 'Paper/2.5.0',
                    node: {
                        selectionStrategy: 'leastLoad',
                        autoMovePlayers: true,
                        avoidUnhealthyNodes: true,
                        maxCpuLoad: 80,
                        maxMemoryUsage: 0.9,
                        retryAmount: 10,
                        retryDelay: 5000
                    },
                    defaultPlayer: {
                        selfDeaf: true,
                        selfMute: false,
                        autoPlay: false,
                        volume: 50,
                        autoLeave: true
                    }
                }
            })

            this.moonlink.use(new Connectors.DiscordJs(), this)

            Logger.info('Moonlink Manager 已初始化')
        } catch (error) {
            Logger.error('初始化 Moonlink Manager 失敗:', error)
            this.moonlink = undefined
        }
    }

    private initErrorHandling() {
        if (process.env.ANTICRASH_WEBHOOK_URL) {
            this.errorWebhook = new WebhookClient({ url: process.env.ANTICRASH_WEBHOOK_URL! })
        }

        process.on('unhandledRejection', (error: Error) => {
            Logger.error(error)
            this.sendErrorToWebhook('未處理的 Promise 拒絕', error)
        })

        process.on('uncaughtException', (error: Error) => {
            Logger.error(error)
            this.sendErrorToWebhook('未捕獲的異常', error)
        })

        this.on('error', (error: Error) => {
            Logger.error(error)
            this.sendErrorToWebhook('Discord 客戶端錯誤', error)
        })
    }

    private async sendErrorToWebhook(title: string, error: Error) {
        if (!this.errorWebhook) return

        try {
            await this.errorWebhook.send({
                embeds: [
                    {
                        title: title,
                        description: `\`\`\`js\n${error.stack || error.message}\n\`\`\``,
                        color: 0xff0000,
                        timestamp: new Date().toISOString()
                    }
                ]
            })
        } catch (err) {
            Logger.error('發送錯誤到 Webhook 失敗:', err as Error)
        }
    }

    /**
     * 獲取所有可用於 Dashboard 配置（非開發者專用）的指令列表。
     * @returns {Array<{ name: string; description: string }>} 可配置指令的陣列。
     */
    getAvailableConfigCommands(): Array<{ name: string; description: string }> {
        const configurableCommands: { name: string; description: string }[] = []

        this.commands.forEach((command) => {
            if (!command.subCommand && !command.developer) {
                configurableCommands.push({
                    name: command.name,
                    description: command.description
                })
            }
        })

        return configurableCommands
    }

    async startApiServer() {
        this.apiServer = new ApiServer(this)
        await this.apiServer.start()
    }

    async stopApiServer(): Promise<void> {
        if (!this.apiServer) return
        await this.apiServer.close()
        this.apiServer = null
    }

    async start({ Production = process.env.NODE_ENV! === 'production' } = {}) {
        Logger.info(
            `>>> Starting Paper Bot in ${Production ? 'Production' : 'Development'} mode...`
        )
        await this.login(Production ? process.env.DISCORD_TOKEN! : process.env.TEST_TOKEN!)
    }
}
