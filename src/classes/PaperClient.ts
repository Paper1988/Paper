import Cookie from '@/libs/utils/youtubeCookies'
import { loadEvents } from '@/Structures/Handlers/eventHandler'
import Giveaway from '@/Systems/Giveaway'
import type { CommandType } from '@/typings/command'
import { BandlabPlugin } from '@distube/bandlab'
import { DeezerPlugin } from '@distube/deezer'
import { DirectLinkPlugin } from '@distube/direct-link'
import { SoundCloudPlugin } from '@distube/soundcloud'
import { SpotifyPlugin } from '@distube/spotify'
import { YouTubePlugin } from '@distube/youtube'
import { YtDlpPlugin } from '@distube/yt-dlp'
import fastifyCors from '@fastify/cors'
import chalk from 'chalk'
import type { ClientOptions } from 'discord.js'
import { Client, Collection, WebhookClient } from 'discord.js'
import { DisTube } from 'distube'
import { AppleMusicPlugin } from 'distube-apple-music'
import { TidalPlugin } from 'distube-tidal'
import dotenv from 'dotenv'
import Fastify from 'fastify'
import fs from 'fs'

if (fs.existsSync('.env.local')) {
    dotenv.config({ path: '.env.local' })
} else {
    dotenv.config()
}

export class PaperClient extends Client {
    override commands: Collection<string, CommandType> = new Collection<string, any>()
    override buttons = new Collection<string, any>()
    override events = new Collection<string, any>()
    override subCommands = new Collection<string, any>()
    override modals = new Collection<string, any>()
    override selectMenus = new Collection<string, any>()
    override contextMenus = new Collection<string, any>()
    override distube!: DisTube
    private errorWebhook: WebhookClient | null = null

    constructor(options: ClientOptions) {
        super(options)
        this.setMaxListeners(0)

        Giveaway(this)

        this.initErrorHandling()

        loadEvents(this)
    }

    private initErrorHandling() {
        if (process.env.ANTICRASH_WEBHOOK_URL) {
            this.errorWebhook = new WebhookClient({ url: process.env.ANTICRASH_WEBHOOK_URL })
        }

        process.on('unhandledRejection', (error: Error) => {
            console.error('未處理的 Promise 拒絕:', error)
            this.sendErrorToWebhook('未處理的 Promise 拒絕', error)
        })

        process.on('uncaughtException', (error: Error) => {
            console.error('未捕獲的異常:', error)
            this.sendErrorToWebhook('未捕獲的異常', error)
        })

        this.on('error', (error: Error) => {
            console.error('Discord 客戶端錯誤:', error)
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
            console.error(chalk.red('發送錯誤到 Webhook 失敗:', err))
        }
    }

    async startFastify() {
        const fastify = Fastify({
            logger: true
        })

        const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001
        const HOST = '0.0.0.0'

        fastify.register(fastifyCors, {
            origin: ['https://paper-dashboard.vercel.app', 'http://localhost:3000'],
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true
        })

        fastify.get('/api/bot-status', async (request, reply) => {
            if (this.isReady()) {
                reply.send({
                    status: 'online',
                    username: this.user?.tag,
                    guildCount: this.guilds.cache.size
                })
            } else {
                reply.code(503).send({ status: 'offline', message: '機器人已離線' })
            }
        })

        fastify.get('/api/guilds', async (request, reply) => {
            // 你可以在這裡添加認證檢查，例如：
            // 檢查請求是否來自已認證的 Dashboard
            // 或是透過 API Key 等方式驗證

            if (!this.isReady()) {
                return reply.code(503).send({ message: 'Bot is not ready yet.' })
            }

            try {
                const guilds = this.guilds.cache.map((guild) => ({
                    id: guild.id,
                    name: guild.name,
                    icon: guild.iconURL(),
                    memberCount: guild.memberCount,
                    ownerId: guild.ownerId
                }))
                reply.send(guilds)
            } catch (error) {
                fastify.log.error('Error fetching guilds:', error)
                reply.code(500).send({
                    message: 'Failed to fetch guilds.',
                    error: error instanceof Error ? error.message : String(error)
                })
            }
        })

        fastify.get('/api/guilds/:guildId', async (request, reply) => {
            const { guildId } = request.params as { guildId: string }

            // 認證檢查：確保只有授權使用者能存取
            // 這是一個可以強化安全性的地方，例如檢查請求是否來自已認證的 Dashboard
            // 並且 session 中的使用者是該 guild 的管理員或擁有者
            // 目前我們假設 Next.js API 路由會處理認證

            if (!this.isReady()) {
                return reply.code(503).send({ message: 'Bot is not ready yet.' })
            }

            try {
                const guild = this.guilds.cache.get(guildId)

                if (!guild) {
                    return reply.code(404).send({ message: 'Guild not found.' })
                }

                // 獲取一些更詳細的資訊
                // 注意：為了獲取頻道等，可能需要 Guilds Intent 和其他相關 Intent
                // 如果你需要列出所有頻道，你可能需要遍歷 guild.channels.cache
                // 這裡只列出基本資訊
                const guildInfo = {
                    id: guild.id,
                    name: guild.name,
                    icon: guild.iconURL(),
                    memberCount: guild.memberCount,
                    ownerId: guild.ownerId,
                    description: guild.description,
                    features: guild.features,
                    preferredLocale: guild.preferredLocale,
                    verificationLevel: guild.verificationLevel,
                    channels: guild.channels.cache.map((channel) => ({
                        id: channel.id,
                        name: channel.name,
                        type: channel.type
                    }))
                    // ... 你可能還需要從資料庫中獲取該伺服器的自訂設定
                }

                reply.send(guildInfo)
            } catch (error) {
                fastify.log.error(`Error fetching guild ${guildId}:`, error)
                reply.code(500).send({
                    message: 'Failed to fetch guild details.',
                    error: error instanceof Error ? error.message : String(error)
                })
            }
        })

        try {
            await fastify.listen({ port: PORT, host: HOST })
            console.log(`Bot API server listening on ${HOST}:${PORT}`)
        } catch (err) {
            fastify.log.error(err)
            throw err
        }
    }

    start({ Production = process.env.NODE_ENV === 'production' } = {}) {
        console.log(
            chalk.green(
                `>>> Starting Paper Bot in ${Production ? 'Production' : 'Development'} mode...`
            )
        )
        this.login(Production ? process.env.DISCORD_TOKEN! : process.env.TEST_TOKEN!)
    }

    initDistube() {
        Cookie.formatExistingFile()
        const cookieStatus = Cookie.getStatus()
        if (!cookieStatus.isValid) {
            console.warn('YouTube cookies are invalid or missing!')
        }
        const cookies = Cookie.getCookies()

        this.distube = new DisTube(this, {
            customFilters: {
                speed_050: 'atempo=0.5',
                speed_075: 'atempo=0.75',
                speed_1: 'atempo=1',
                speed_125: 'atempo=1.25',
                speed_150: 'atempo=1.5',
                speed_175: 'atempo=1.75',
                speed_2: 'atempo=2'
            },
            emitNewSongOnly: true,
            emitAddSongWhenCreatingQueue: false,
            emitAddListWhenCreatingQueue: false,
            nsfw: true,
            plugins: [
                new YouTubePlugin({
                    ytdlOptions: {
                        lang: 'zh-TW',
                        playerClients: ['WEB_EMBEDDED', 'IOS', 'ANDROID', 'TV', 'WEB']
                    },
                    cookies
                }),
                new SpotifyPlugin({
                    api: {
                        clientId: process.env.SPOTIFY_CLIENT_ID!,
                        clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
                        topTracksCountry: 'TW'
                    }
                }),
                new SoundCloudPlugin({
                    clientId: process.env.SOUNDCLOUD_CLIENT_ID!,
                    oauthToken: process.env.SOUNDCLOUD_OAUTH_TOKEN!
                }),
                new DirectLinkPlugin(),
                new TidalPlugin(),
                new DeezerPlugin(),
                new AppleMusicPlugin(),
                new BandlabPlugin(),
                new YtDlpPlugin({ update: true })
            ]
        })
    }
}
