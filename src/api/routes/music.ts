import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { authorizeGuildManager } from '../authorization.js'
import Genius from 'genius-lyrics'

export function registerMusicRoutes(fastify: FastifyInstance, client: PaperClient) {
    type MusicParams = { Params: { guildId: string } }
    type Body<T> = { Body: T }
    const limit = { max: 30, timeWindow: '1 minute' }
    const getPlayer = (guildId: string) => client.moonlink?.players.get(guildId) ?? null
    const authorize = (guildId: string, request: FastifyRequest, reply: FastifyReply) =>
        authorizeGuildManager(client, request, reply, guildId)

    fastify.get<MusicParams>({
        url: '/api/guilds/:guildId/music/queue', config: { rateLimit: limit },
        handler: async (request, reply) => {
            const { guildId } = request.params
            if (!(await authorize(guildId, request, reply))) return
            const player = getPlayer(guildId)
            if (!player || !player.playing) return reply.send({
                playing: false, paused: false, position: 0, volume: player?.volume ?? 50,
                repeatMode: player?.loop ?? 'off', autoPlay: player?.autoPlay ?? false,
                queueLength: player?.queue.tracks.length ?? 0, previousAvailable: (player?.previous.length ?? 0) > 0,
                tracks: []
            })
            return reply.send({
                playing: true, paused: player.paused, position: player.position, repeatMode: player.loop,
                volume: player.volume, autoPlay: player.autoPlay, queueLength: player.queue.tracks.length,
                previousAvailable: player.previous.length > 0,
                currentTrack: {
                    title: player.current?.title, url: player.current?.uri, duration: player.current?.duration,
                    thumbnail: player.current?.thumbnail, author: player.current?.author,
                    requestedBy: player.current?.requester?.id, isStream: player.current?.isStream
                },
                tracks: player.queue.tracks.slice(0, 10).map((track: any) => ({
                    title: track.title, url: track.uri ?? track.url, duration: track.duration,
                    thumbnail: track.thumbnail, author: track.author,
                    requestedBy: track.requester?.id ?? track.requestedBy?.id
                }))
            })
        }
    })

    fastify.post<MusicParams & Body<{ action?: string; value?: unknown }>>({
        url: '/api/guilds/:guildId/music/control', config: { rateLimit: limit },
        handler: async (request, reply) => {
            const { guildId } = request.params
            if (!(await authorize(guildId, request, reply))) return
            const player = getPlayer(guildId)
            const { action, value } = request.body ?? {}
            if (!player) return reply.code(400).send({ message: '目前沒有音樂播放器' })
            try {
                switch (action) {
                    case 'pause':
                        if (!player.playing || player.paused) return reply.code(409).send({ message: '目前無法暫停音樂' })
                        await player.pause(); break
                    case 'resume':
                        if (!player.playing || !player.paused) return reply.code(409).send({ message: '目前無法恢復播放' })
                        await player.resume(); break
                    case 'skip':
                        if (!player.playing) return reply.code(409).send({ message: '目前沒有正在播放的音樂' })
                        await player.skip(); break
                    case 'previous':
                        if (!player.current || player.previous.length === 0) return reply.code(409).send({ message: '沒有上一首歌曲' })
                        await player.back(); break
                    case 'stop':
                        player.destroy(); return reply.send({ ok: true, stopped: true })
                    case 'volume':
                        if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100) return reply.code(400).send({ message: '音量必須介於 0 到 100' })
                        await player.setVolume(value); break
                    case 'loop':
                        if (value !== 'off' && value !== 'track' && value !== 'queue') return reply.code(400).send({ message: '循環模式無效' })
                        await player.setLoop(value); break
                    case 'autoplay':
                        if (typeof value !== 'boolean') return reply.code(400).send({ message: '自動播放必須是布林值' })
                        player.setAutoPlay(value); break
                    case 'shuffle':
                        if (player.queue.tracks.length < 2) return reply.code(409).send({ message: '佇列至少需要兩首歌曲才能隨機排序' })
                        player.shuffle(); break
                    default: return reply.code(400).send({ message: '不支援的音樂操作' })
                }
                return reply.send({ ok: true, playing: player.playing, paused: player.paused, position: player.position, volume: player.volume, repeatMode: player.loop, autoPlay: player.autoPlay })
            } catch (error) {
                request.log.error(error, '音樂控制操作失敗')
                return reply.code(500).send({ message: '音樂控制操作失敗' })
            }
        }
    })

    fastify.post<MusicParams & Body<{ query?: string }>>({
        url: '/api/guilds/:guildId/music/search', config: { rateLimit: limit },
        handler: async (request, reply) => {
            const { guildId } = request.params
            if (!(await authorize(guildId, request, reply))) return
            const query = request.body?.query?.trim()
            if (!query || query.length > 500) return reply.code(400).send({ message: '搜尋內容必須為 1 到 500 字元' })
            if (!client.moonlink) return reply.code(503).send({ message: '音樂服務尚未初始化' })
            try {
                const result = await client.moonlink.search({ query })
                return reply.send({ tracks: result.tracks.slice(0, 10).map((track: any) => ({
                    title: track.title, url: track.uri, duration: track.duration,
                    thumbnail: track.thumbnail, author: track.author, source: track.source
                })) })
            } catch (error) {
                request.log.error(error, '搜尋歌曲失敗')
                return reply.code(502).send({ message: '搜尋歌曲失敗，請稍後再試' })
            }
        }
    })

    fastify.post<MusicParams & Body<{ url?: string }>>({
        url: '/api/guilds/:guildId/music/add', config: { rateLimit: limit },
        handler: async (request, reply) => {
            const { guildId } = request.params
            if (!(await authorize(guildId, request, reply))) return
            const url = request.body?.url?.trim()
            if (!url || url.length > 2000) return reply.code(400).send({ message: '歌曲網址無效' })
            const player = getPlayer(guildId)
            if (!player || !client.moonlink) return reply.code(409).send({ message: '請先在 Discord 中啟動音樂播放器並加入語音頻道' })
            try {
                const result = await client.moonlink.search({ query: url })
                const track = result.tracks[0]
                if (!track) return reply.code(404).send({ message: '找不到歌曲' })
                player.queue.add(track)
                if (!player.playing && !player.paused) await player.play()
                return reply.send({ ok: true, track: { title: track.title, url: track.uri, duration: track.duration, thumbnail: track.thumbnail, author: track.author }, queueLength: player.queue.tracks.length })
            } catch (error) {
                request.log.error(error, '加入歌曲失敗')
                return reply.code(502).send({ message: '加入歌曲失敗，請稍後再試' })
            }
        }
    })

    fastify.get<MusicParams>({
        url: '/api/guilds/:guildId/music/lyrics', config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
        handler: async (request, reply) => {
            const { guildId } = request.params
            if (!(await authorize(guildId, request, reply))) return
            const track = getPlayer(guildId)?.current
            if (!track) return reply.code(404).send({ message: '目前沒有正在播放的歌曲' })
            try {
                const genius = new Genius.Client()
                const songs = await genius.songs.search([track.title, track.author].filter(Boolean).join(' '))
                if (!songs.length) return reply.code(404).send({ message: 'Genius 找不到這首歌的歌詞' })
                let lyrics = ''
                let matchedSong: any = songs[0]
                for (const song of songs.slice(0, 5)) {
                    try {
                        const found = await song.lyrics()
                        if (found?.trim()) { lyrics = found.trim(); matchedSong = song; break }
                    } catch { /* Continue to the next candidate if a Genius page cannot be read. */ }
                }
                if (!lyrics) return reply.code(404).send({ message: '找到歌曲資料，但無法讀取歌詞。' })
                return reply.send({
                    title: track.title, author: track.author, url: matchedSong.url,
                    lyrics: lyrics.slice(0, 20000), truncated: lyrics.length > 20000, source: 'Genius'
                })
            } catch (error) {
                request.log.error(error, '取得歌詞失敗')
                return reply.code(502).send({ message: '歌詞服務暫時無法使用，請稍後再試' })
            }
        }
    })

    fastify.post<MusicParams>({
        url: '/api/guilds/:guildId/music/previous', config: { rateLimit: limit },
        handler: async (request, reply) => {
            const { guildId } = request.params
            if (!(await authorize(guildId, request, reply))) return
            const player = getPlayer(guildId)
            if (!player?.current) return reply.code(400).send({ message: '目前沒有正在播放的音樂' })
            if (!player.previous.length) return reply.code(409).send({ message: '沒有上一首歌曲' })
            await player.back()
            return reply.send({ ok: true })
        }
    })

    fastify.put<MusicParams & Body<{ volume?: number }>>({
        url: '/api/guilds/:guildId/music/volume', config: { rateLimit: limit },
        handler: async (request, reply) => {
            const { guildId } = request.params
            if (!(await authorize(guildId, request, reply))) return
            const player = getPlayer(guildId), volume = request.body?.volume
            if (!player) return reply.code(400).send({ message: '目前沒有音樂播放器' })
            if (typeof volume !== 'number' || !Number.isFinite(volume) || volume < 0 || volume > 100) return reply.code(400).send({ message: '音量必須介於 0 到 100' })
            await player.setVolume(volume)
            return reply.send({ ok: true, volume: player.volume })
        }
    })

    fastify.put<MusicParams & Body<{ mode?: string }>>({
        url: '/api/guilds/:guildId/music/loop', config: { rateLimit: limit },
        handler: async (request, reply) => {
            const { guildId } = request.params
            if (!(await authorize(guildId, request, reply))) return
            const player = getPlayer(guildId), mode = request.body?.mode
            if (!player) return reply.code(400).send({ message: '目前沒有音樂播放器' })
            if (mode !== 'off' && mode !== 'track' && mode !== 'queue') return reply.code(400).send({ message: '循環模式無效' })
            await player.setLoop(mode)
            return reply.send({ ok: true, repeatMode: player.loop })
        }
    })

    fastify.post<MusicParams>({
        url: '/api/guilds/:guildId/music/shuffle', config: { rateLimit: limit },
        handler: async (request, reply) => {
            const { guildId } = request.params
            if (!(await authorize(guildId, request, reply))) return
            const player = getPlayer(guildId)
            if (!player?.current) return reply.code(400).send({ message: '目前沒有正在播放的音樂' })
            if (player.queue.tracks.length < 2) return reply.code(409).send({ message: '佇列至少需要兩首歌曲才能隨機排序' })
            player.shuffle()
            return reply.send({ ok: true, queueLength: player.queue.tracks.length })
        }
    })

    fastify.put<MusicParams & Body<{ enabled?: boolean }>>({
        url: '/api/guilds/:guildId/music/autoplay', config: { rateLimit: limit },
        handler: async (request, reply) => {
            const { guildId } = request.params
            if (!(await authorize(guildId, request, reply))) return
            const player = getPlayer(guildId), enabled = request.body?.enabled
            if (!player) return reply.code(400).send({ message: '目前沒有音樂播放器' })
            if (typeof enabled !== 'boolean') return reply.code(400).send({ message: '自動播放設定無效' })
            player.setAutoPlay(enabled)
            return reply.send({ ok: true, autoPlay: player.autoPlay })
        }
    })

    fastify.delete<MusicParams>({
        url: '/api/guilds/:guildId/music/queue', config: { rateLimit: limit },
        handler: async (request, reply) => {
            const { guildId } = request.params
            if (!(await authorize(guildId, request, reply))) return
            const player = getPlayer(guildId)
            if (!player) return reply.code(400).send({ message: '目前沒有音樂播放器' })
            player.destroy()
            return reply.send({ ok: true })
        }
    })
}
