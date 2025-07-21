import { loadEvents } from '@/Structures/Handlers/eventHandler.js'
import Giveaway from '@/Systems/Giveaway.js'
import { checkAndNotify } from '@/libs/utils/checkCookies.js'
import { Logger } from '@/libs/utils/logger.js'
import Cookie from '@/libs/utils/youtubeCookies.js'
import type { CommandType } from '@/typings/command.js'
import type { ButtonType, MenuType, ModalType } from '@/typings/component.js'
import type { EventExecute } from '@/typings/event.js'
import { BandlabPlugin } from '@distube/bandlab'
import { DeezerPlugin } from '@distube/deezer'
import { DirectLinkPlugin } from '@distube/direct-link'
import { SoundCloudPlugin } from '@distube/soundcloud'
import { SpotifyPlugin } from '@distube/spotify'
import { YouTubePlugin } from '@distube/youtube'
import { YtDlpPlugin } from '@distube/yt-dlp'
import type { ClientOptions } from 'discord.js'
import { Client, Collection, WebhookClient } from 'discord.js'
import { DisTube } from 'distube'
import { AppleMusicPlugin } from 'distube-apple-music'
import { TidalPlugin } from 'distube-tidal'
import dotenv from 'dotenv'
import fs from 'fs'

if (fs.existsSync('.env.local')) {
    dotenv.config({ path: '.env.local' })
} else {
    dotenv.config()
}

export class PaperClient extends Client {
    override commands: Collection<string, CommandType> = new Collection<string, CommandType>()
    override buttons: Collection<string, ButtonType> = new Collection<string, ButtonType>()
    override events: Collection<string, EventExecute> = new Collection<string, EventExecute>()
    override subCommands = new Collection<string, any>()
    override modals: Collection<string, ModalType> = new Collection<string, ModalType>()
    override selectMenus: Collection<string, MenuType> = new Collection<string, MenuType>()
    override contextMenus = new Collection<string, any>()
    override distube!: DisTube
    private errorWebhook: WebhookClient | null = null
    private apiServer: any = null

    constructor(options: ClientOptions) {
        super(options)
        this.setMaxListeners(0)

        Giveaway(this)

        this.initErrorHandling()

        loadEvents(this)
    }

    private initErrorHandling() {
        if (process.env.ANTICRASH_WEBHOOK_URL!) {
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

    /**
     * 啟動 API 伺服器
     */
    async startApiServer() {
        const { ApiServer } = await import('@/api/server.js')
        this.apiServer = new ApiServer(this)
        await this.apiServer.start()
    }

    start({ Production = process.env.NODE_ENV! === 'production' } = {}) {
        Logger.info(
            `>>> Starting Paper Bot in ${Production ? 'Production' : 'Development'} mode...`
        )
        this.login(Production ? process.env.DISCORD_TOKEN! : process.env.TEST_TOKEN!)
    }

    /**
     * 初始化 DisTube 音樂播放器
     * 配置所有支援的音樂平台插件和自定義過濾器
     */
    initDistube(): void {
        try {
            // 初始化 YouTube cookies
            this.initYouTubeCookies()

            // 創建 DisTube 實例
            this.distube = new DisTube(this, this.getDistubeConfig())

            Logger.info('DisTube 初始化成功')
        } catch (error) {
            Logger.error('DisTube 初始化失敗:', error as Error)
            throw error
        }
    }

    /**
     * 初始化 YouTube cookies
     */
    private initYouTubeCookies(): void {
        Cookie.formatExistingFile()
        const cookieStatus = Cookie.getStatus()

        if (!cookieStatus.isValid) {
            Logger.warn('YouTube cookies 無效或缺失，某些功能可能受限')
        }
    }

    /**
     * 獲取 DisTube 配置
     */
    private getDistubeConfig() {
        return {
            customFilters: this.getCustomFilters(),
            emitNewSongOnly: true,
            emitAddSongWhenCreatingQueue: false,
            emitAddListWhenCreatingQueue: false,
            nsfw: true,
            plugins: this.getDistubePlugins()
        }
    }

    /**
     * 獲取自定義音頻過濾器
     */
    private getCustomFilters() {
        return {
            speed_025: 'atempo=0.25',
            speed_050: 'atempo=0.5',
            speed_075: 'atempo=0.75',
            speed_1: 'atempo=1',
            speed_125: 'atempo=1.25',
            speed_150: 'atempo=1.5',
            speed_175: 'atempo=1.75',
            speed_2: 'atempo=2'
        } as const
    }

    /**
     * 獲取 DisTube 插件配置
     */
    private getDistubePlugins() {
        const plugins: any[] = []

        // YouTube 插件
        plugins.push(this.createYouTubePlugin())

        // Spotify 插件
        if (this.isSpotifyConfigured()) {
            plugins.push(this.createSpotifyPlugin())
        }

        // SoundCloud 插件
        if (this.isSoundCloudConfigured()) {
            plugins.push(this.createSoundCloudPlugin())
        }

        // 其他插件（無需配置）
        plugins.push(
            new DirectLinkPlugin(),
            new TidalPlugin(),
            new DeezerPlugin(),
            new AppleMusicPlugin(),
            new BandlabPlugin(),
            new YtDlpPlugin({ update: true })
        )

        return plugins
    }

    /**
     * 創建 YouTube 插件
     */
    private createYouTubePlugin() {
        const cookies = Cookie.getCookies()

        checkAndNotify(this)

        return new YouTubePlugin({
            ytdlOptions: {
                lang: 'zh-TW',
                playerClients: ['WEB_EMBEDDED', 'IOS', 'ANDROID', 'TV', 'WEB']
            },
            cookies
        })
    }

    /**
     * 創建 Spotify 插件
     */
    private createSpotifyPlugin() {
        const clientId = process.env.SPOTIFY_CLIENT_ID
        const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

        if (!clientId || !clientSecret) {
            throw new Error('Spotify 配置缺失：需要 SPOTIFY_CLIENT_ID 和 SPOTIFY_CLIENT_SECRET')
        }

        return new SpotifyPlugin({
            api: {
                clientId,
                clientSecret,
                topTracksCountry: 'TW'
            }
        })
    }

    /**
     * 創建 SoundCloud 插件
     */
    private createSoundCloudPlugin() {
        const clientId = process.env.SOUNDCLOUD_CLIENT_ID
        const oauthToken = process.env.SOUNDCLOUD_OAUTH_TOKEN

        if (!clientId || !oauthToken) {
            throw new Error(
                'SoundCloud 配置缺失：需要 SOUNDCLOUD_CLIENT_ID 和 SOUNDCLOUD_OAUTH_TOKEN'
            )
        }

        return new SoundCloudPlugin({
            clientId,
            oauthToken
        })
    }

    /**
     * 檢查 Spotify 是否已配置
     */
    private isSpotifyConfigured(): boolean {
        return !!(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET)
    }

    /**
     * 檢查 SoundCloud 是否已配置
     */
    private isSoundCloudConfigured(): boolean {
        return !!(process.env.SOUNDCLOUD_CLIENT_ID && process.env.SOUNDCLOUD_OAUTH_TOKEN)
    }
}
