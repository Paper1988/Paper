import GuildConfig from '@/Structures/Schemas/GuildConfig.js'
import type { PaperClient } from '@/classes/PaperClient.js'
import { aggregateWeeklyStats } from '@/jobs/weeklyAggregation'
import { YouTubePlugin } from '@distube/youtube'
import fastifyCors from '@fastify/cors'
import { Events } from 'distube'
import Fastify from 'fastify'

export class ApiServer {
    private fastify: any
    private client: PaperClient

    constructor(client: PaperClient) {
        this.client = client
        this.fastify = Fastify({
            logger: true
        })
        this.setupCors()
        this.setupRoutes()
    }

    private setupCors() {
        this.fastify.register(fastifyCors, {
            origin: ['https://paper-dashboard.vercel.app', 'http://localhost:3000'],
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true
        })
    }

    private setupRoutes() {
        // Bot 狀態路由
        this.fastify.get('/api/bot-status', async (request: any, reply: any) => {
            if (this.client.isReady()) {
                reply.send({
                    status: 'online',
                    username: this.client.user?.tag,
                    guildCount: this.client.guilds.cache.size
                })
            } else {
                reply.code(503).send({ status: 'offline', message: '機器人已離線' })
            }
        })

        // 獲取所有伺服器列表
        this.fastify.get('/api/guilds', async (request: any, reply: any) => {
            if (!this.client.isReady()) {
                return reply.code(503).send({ message: 'Bot is not ready yet.' })
            }

            try {
                const { userId } = request.query as { userId?: string }

                if (!userId) {
                    return reply.code(400).send({ message: 'userId parameter is required' })
                }

                const userGuilds: Array<{
                    id: string
                    name: string
                    icon: string | null
                    memberCount: number
                    ownerId: string
                }> = []

                for (const guild of this.client.guilds.cache.values()) {
                    try {
                        // 獲取用戶在該伺服器中的成員資訊
                        const member = await guild.members.fetch(userId)

                        // 檢查用戶是否有管理伺服器的權限
                        // 包括：管理伺服器、管理角色、管理頻道、管理訊息等權限
                        const hasManagePermissions =
                            member.permissions.has('ManageGuild') ||
                            member.permissions.has('ManageRoles') ||
                            member.permissions.has('ManageChannels') ||
                            member.permissions.has('ManageMessages') ||
                            member.permissions.has('Administrator')

                        if (hasManagePermissions) {
                            userGuilds.push({
                                id: guild.id,
                                name: guild.name,
                                icon: guild.iconURL(),
                                memberCount: guild.memberCount,
                                ownerId: guild.ownerId
                            })
                        }
                    } catch (memberError) {
                        // 如果無法獲取成員資訊（用戶不在該伺服器中），則跳過
                        this.fastify.log.debug(
                            `User ${userId} not found in guild ${guild.id}: ${memberError}`
                        )
                        continue
                    }
                }

                reply.send(userGuilds)
            } catch (error) {
                this.fastify.log.error('Error fetching guilds:', error)
                reply.code(500).send({
                    message: 'Failed to fetch guilds.',
                    error: error instanceof Error ? error.message : String(error)
                })
            }
        })

        // 獲取特定伺服器詳細資訊
        this.fastify.get('/api/guilds/:guildId', async (request: any, reply: any) => {
            const { guildId } = request.params as { guildId: string }

            if (!this.client.isReady()) {
                return reply.code(503).send({ message: 'Bot is not ready yet.' })
            }

            try {
                const guild = this.client.guilds.cache.get(guildId)

                if (!guild) {
                    return reply.code(404).send({ message: 'Guild not found.' })
                }

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
                }

                reply.send(guildInfo)
            } catch (error) {
                this.fastify.log.error(`Error fetching guild ${guildId}:`, error)
                reply.code(500).send({
                    message: 'Failed to fetch guild details.',
                    error: error instanceof Error ? error.message : String(error)
                })
            }
        })

        // 獲取伺服器配置
        this.fastify.get('/api/guilds/:guildId/config', async (request: any, reply: any) => {
            const { guildId } = request.params as { guildId: string }

            if (!this.client.isReady()) {
                return reply.code(503).send({ message: 'Bot is not ready yet.' })
            }

            try {
                const guildConfig = await GuildConfig.findOne({ guildId })
                if (!guildConfig) {
                    return reply.send({
                        guildId,
                        disabledCommands: []
                    })
                }
                reply.send(guildConfig)
            } catch (error) {
                this.fastify.log.error(`Error fetching config for guild ${guildId}:`, error)
                reply.code(500).send({
                    message: 'Failed to fetch guild configuration.',
                    error: error instanceof Error ? error.message : String(error)
                })
            }
        })

        // 獲取可用指令列表
        this.fastify.get('/api/commands', async (request: any, reply: any) => {
            if (!this.client.isReady()) {
                return reply.code(503).send({ message: 'Bot is not ready yet.' })
            }
            reply.send(this.client.getAvailableConfigCommands())
        })

        this.fastify.get('/api/guilds/:guildId/music/status', async (request, reply) => {
            const { guildId } = request.params

            try {
                const queue = this.client.distube.queues.get(guildId)

                if (!queue) {
                    return reply.send({
                        status: 'idle',
                        message: '目前沒有播放音樂'
                    })
                }
                if (!queue.songs[0]) {
                    return reply.send({
                        status: 'idle',
                        message: '佇列中沒有歌曲'
                    })
                }

                const currentSong = queue.songs[0]
                const nextSongs = queue.songs.slice(1, 6) // 顯示接下來5首歌

                return reply.send({
                    status: queue.paused ? 'paused' : 'playing',
                    currentSong: {
                        name: currentSong.name,
                        url: currentSong.url,
                        duration: currentSong.duration,
                        thumbnail: currentSong.thumbnail,
                        uploader: currentSong.uploader?.name,
                        user: currentSong.user?.displayName,
                        source: currentSong.source,
                        isLive: currentSong.isLive
                    },
                    queue: {
                        current: queue.currentTime,
                        total: currentSong.duration,
                        progress: (queue.currentTime / currentSong.duration) * 100,
                        nextSongs: nextSongs.map((song) => ({
                            name: song.name,
                            duration: song.duration,
                            uploader: song.uploader?.name,
                            user: song.user?.displayName
                        })),
                        totalSongs: queue.songs.length,
                        previousSongs: queue.previousSongs.length
                    },
                    settings: {
                        volume: queue.volume,
                        repeatMode: queue.repeatMode, // 0: 關閉, 1: 單曲, 2: 整個清單
                        autoplay: queue.autoplay,
                        filters: queue.filters.names
                    },
                    voiceChannel: {
                        name: queue.voiceChannel?.name,
                        id: queue.voiceChannel?.id,
                        memberCount: queue.voiceChannel?.members?.size
                    }
                })
            } catch (error) {
                reply.code(500).send({ error: '獲取音樂狀態失敗' })
            }
        })

        this.fastify.post('/api/guilds/:guildId/music/control', async (request, reply) => {
            const { guildId } = request.params
            const { action, value } = request.body as { action: string; value?: any }

            try {
                const queue = this.client.distube.queues.get(guildId)
                if (!queue) {
                    return reply.code(404).send({ error: '沒有正在播放的音樂' })
                }

                switch (action) {
                    case 'play':
                        await queue.resume()
                        break
                    case 'pause':
                        await queue.pause()
                        break
                    case 'skip':
                        await queue.skip()
                        break
                    case 'stop':
                        await queue.stop()
                        break
                    case 'shuffle':
                        await queue.shuffle()
                        break
                    case 'volume':
                        if (typeof value === 'number' && value >= 0 && value <= 200) {
                            queue.setVolume(value)
                        }
                        break
                    case 'seek':
                        if (typeof value === 'number' && value >= 0) {
                            queue.seek(value)
                        }
                        break
                    case 'autoplay':
                        queue.autoplay = !queue.autoplay
                        break
                    case 'repeat':
                        queue.setRepeatMode(value) // 0, 1, 2
                        break
                    default:
                        return reply.code(400).send({ error: '無效的操作' })
                }

                reply.send({ success: true, action })
            } catch (error) {
                reply.code(500).send({ error: '操作失敗' })
            }
        })

        this.fastify.get('/api/guilds/:guildId/music/search', async (request, reply) => {
            const { guildId } = request.params
            const { query, limit = 10 } = request.query as { query: string; limit?: number }

            if (!query) {
                return reply.code(400).send({ error: '請提供搜尋關鍵字' })
            }

            try {
                const queue = this.client.distube.queues.get(guildId)
                if (!queue) {
                    return reply.code(404).send({ error: '請先加入語音頻道' })
                }

                const ytPlugin = new YouTubePlugin()
                if (!ytPlugin) {
                    return reply.code(500).send({ error: 'YouTube 插件未載入' })
                }

                const results = await ytPlugin.search(query, { limit })

                reply.send({
                    results: results.map((song) => ({
                        name: song.name,
                        url: song.url,
                        duration: song.duration,
                        uploader: song.uploader?.name,
                        thumbnail: song.thumbnail,
                        source: song.source
                    }))
                })
            } catch (error) {
                reply.code(500).send({ error: '搜尋失敗' })
            }
        })

        this.fastify.get('/api/guilds/:guildId/music/queue', async (request, reply) => {
            const { guildId } = request.params
            const { page = 1, limit = 20 } = request.query as { page?: number; limit?: number }

            try {
                const queue = this.client.distube.queues.get(guildId)
                if (!queue) {
                    return reply.send({ songs: [], total: 0, currentPage: 1 })
                }

                const startIndex = (page - 1) * limit
                const endIndex = startIndex + limit
                const songs = queue.songs.slice(startIndex, endIndex)

                reply.send({
                    songs: songs.map((song) => ({
                        name: song.name,
                        url: song.url,
                        duration: song.duration,
                        uploader: song.uploader?.name,
                        user: song.user?.displayName,
                        thumbnail: song.thumbnail
                    })),
                    total: queue.songs.length,
                    currentPage: page,
                    totalPages: Math.ceil(queue.songs.length / limit)
                })
            } catch (error) {
                reply.code(500).send({ error: '獲取播放清單失敗' })
            }
        })

        this.fastify.get('/api/guilds/:guildId/music/filters', async (request, reply) => {
            const { guildId } = request.params

            try {
                const queue = this.client.distube.queues.get(guildId)
                if (!queue) {
                    return reply.code(404).send({ error: '沒有正在播放的音樂' })
                }

                // 獲取所有可用的過濾器
                const availableFilters = {
                    // 音頻過濾器
                    audio: ['3d', 'bassboost', 'echo', 'karaoke', 'nightcore', 'vaporwave'],
                    // 速度過濾器
                    speed: [
                        'speed_025',
                        'speed_050',
                        'speed_075',
                        'speed_1',
                        'speed_125',
                        'speed_150',
                        'speed_175',
                        'speed_2'
                    ],
                    // 自定義過濾器
                    custom: Object.keys(queue.filters.names)
                }

                reply.send({
                    current: queue.filters.names,
                    available: availableFilters
                })
            } catch (error) {
                reply.code(500).send({ error: '獲取過濾器失敗' })
            }
        })

        // 設定過濾器
        this.fastify.post('/api/guilds/:guildId/music/filters', async (request, reply) => {
            const { guildId } = request.params
            const { filter, enabled } = request.body as { filter: string; enabled: boolean }

            try {
                const queue = this.client.distube.queues.get(guildId)
                if (!queue) {
                    return reply.code(404).send({ error: '沒有正在播放的音樂' })
                }

                if (enabled) {
                    queue.filters.add(filter)
                } else {
                    queue.filters.remove(filter)
                }

                reply.send({
                    success: true,
                    filter,
                    enabled,
                    currentFilters: queue.filters.names
                })
            } catch (error) {
                reply.code(500).send({ error: '設定過濾器失敗' })
            }
        })

        // 移除歌曲
        this.fastify.delete('/api/guilds/:guildId/music/queue/:index', async (request, reply) => {
            const { guildId, index } = request.params
            const songIndex = parseInt(index)

            try {
                const queue = this.client.distube.queues.get(guildId)
                if (!queue || songIndex < 0 || songIndex >= queue.songs.length) {
                    return reply.code(404).send({ error: '歌曲不存在' })
                }

                const removedSong = queue.songs.splice(songIndex, 1)[0]
                if (!removedSong) {
                    return reply.code(404).send({ error: '歌曲不存在' })
                }
                reply.send({ success: true, removedSong: removedSong.name })
            } catch (error) {
                reply.code(500).send({ error: '移除歌曲失敗' })
            }
        })

        this.fastify.get('/api/ws/music/:guildId', { websocket: true }, (connection, req) => {
            const { guildId } = req.params

            // 發送初始狀態
            const sendMusicStatus = () => {
                const queue = this.client.distube.queues.get(guildId)
                if (queue) {
                    connection.socket.send(
                        JSON.stringify({
                            type: 'music_status',
                            data: {
                                status: queue.paused ? 'paused' : 'playing',
                                currentSong: queue.songs[0],
                                currentTime: queue.currentTime,
                                volume: queue.volume,
                                queueLength: queue.songs.length
                            }
                        })
                    )
                }
            }

            // 每秒更新一次狀態
            const interval = setInterval(sendMusicStatus, 1000)

            // 監聽音樂事件
            const handleMusicEvent = (eventQueue: any) => {
                if (eventQueue.id === guildId) {
                    sendMusicStatus()
                }
            }

            this.client.distube
                .on(Events.PLAY_SONG, handleMusicEvent)
                .on(Events.ADD_SONG, handleMusicEvent)
                .on(Events.FINISH_SONG, handleMusicEvent)
                .on(Events.DISCONNECT, handleMusicEvent)

            // 清理連接
            connection.socket.on('close', () => {
                clearInterval(interval)
                this.client.distube
                    .off(Events.PLAY_SONG, handleMusicEvent)
                    .off(Events.ADD_SONG, handleMusicEvent)
                    .off(Events.FINISH_SONG, handleMusicEvent)
                    .off(Events.DISCONNECT, handleMusicEvent)
            })
        })

        this.fastify.get('/aggregateWeeklyStats', async (request, reply) => {
            try {
                await aggregateWeeklyStats()
                reply.code(200).send({ ok: true })
            } catch (err) {
                console.error(err)
                reply.code(500).send({ ok: false, error: err })
            }
        })

        this.fastify.get('/health', async (request, reply) => {
            await reply.code(200)
            return { status: 'ok', timestamp: new Date().toISOString() }
        })
    }

    async start() {
        const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001
        const HOST = '0.0.0.0'

        try {
            await this.fastify.listen({ port: PORT, host: HOST })
            console.log(`Bot API server listening on ${HOST}:${PORT}`)
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
        } catch (err) {
            this.fastify.log.error(err)
            throw err
        }
    }
}
