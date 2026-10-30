import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import type { FastifyInstance, FastifyRequest } from 'fastify'
import { authorizeGuildManager } from '../authorization.js'

export function registerMusicRoutes(fastify: FastifyInstance, client: PaperClient) {
        type MusicParams = { Params: { guildId: string } }

        const musicRouteRateLimit = {
            max: 30,
            timeWindow: '1 minute'
        }

        const getPlayer = (guildId: string) => {
            const player = client.moonlink?.players.get(guildId)
            if (!player) return null
            return player
        }

        // Return playback status in one request instead of polling every guild queue.
        fastify.get(
            '/api/music/servers',
            { config: { rateLimit: musicRouteRateLimit } },
            async (request, reply) => {
                const userId = request.headers['x-discord-id']
                if (typeof userId !== 'string' || !/^\\d{17,20}$/.test(userId)) {
                    return reply.code(401).send({ message: '使用者身分無效或缺失' })
                }

                if (!client.isReady()) {
                    return reply.code(503).send({ message: '機器人尚未上線' })
                }

                const playingGuildIds = (
                    await Promise.all(
                        client.guilds.cache.map(async (guild) => {
                            let canManage = guild.ownerId === userId

                            if (!canManage) {
                                try {
                                    const member =
                                        guild.members.cache.get(userId) ??
                                        (await guild.members.fetch(userId))
                                    canManage =
                                        member.permissions.has('Administrator') ||
                                        member.permissions.has('ManageGuild')
                                } catch {
                                    canManage = false
                                }
                            }

                            if (!canManage) return null
                            const player = getPlayer(guild.id)
                            return player?.playing ? guild.id : null
                        })
                    )
                ).filter((guildId): guildId is string => guildId !== null)

                return reply.send({ playingGuildIds })
            }
        )

        fastify.get<MusicParams>({
            url: '/api/guilds/:guildId/music/queue',
            config: { rateLimit: musicRouteRateLimit },
            handler: async (request, reply) => {
                const { guildId } = request.params
                if (!(await authorizeGuildManager(client, request, reply, guildId))) return
                const player = getPlayer(guildId)

                if (!player || !player.playing) {
                    return reply.send({ playing: false, tracks: [] })
                }

                reply.send({
                    playing: true,
                    paused: player.paused,
                    repeatMode: player.loop,
                    volume: player.volume,
                    currentTrack: {
                        title: player.current?.title,
                        url: player.current?.uri,
                        duration: player.current?.duration,
                        thumbnail: player.current?.thumbnail,
                        author: player.current?.author,
                        requestedBy: player.current?.requester?.id
                    },
                    tracks: player.queue.tracks.map((track: any) => ({
                        title: track.title,
                        url: track.url,
                        duration: track.duration,
                        thumbnail: track.thumbnail,
                        author: track.author,
                        requestedBy: track.requestedBy?.id
                    }))
                })
            }
        })

        fastify.post<MusicParams>({
            url: '/api/guilds/:guildId/music/skip',
            config: { rateLimit: musicRouteRateLimit },
            handler: async (request, reply) => {
                const { guildId } = request.params
                if (!(await authorizeGuildManager(client, request, reply, guildId))) return
                const player = getPlayer(guildId)

                if (!player || !player.playing) {
                    return reply.code(400).send({ message: '目前沒有在播放音樂' })
                }

                await player.skip()
                reply.send({ ok: true })
            }
        })

        fastify.post<MusicParams>({
            url: '/api/guilds/:guildId/music/pause',
            config: { rateLimit: musicRouteRateLimit },
            handler: async (request, reply) => {
                const { guildId } = request.params
                if (!(await authorizeGuildManager(client, request, reply, guildId))) return
                const player = getPlayer(guildId)

                if (!player || !player.playing) {
                    return reply.code(400).send({ message: '目前沒有在播放音樂' })
                }

                if (player.paused) {
                    return reply.code(400).send({ message: '音樂已經是暫停狀態' })
                }

                await player.pause()
                reply.send({ ok: true })
            }
        })

        fastify.post<MusicParams>({
            url: '/api/guilds/:guildId/music/resume',
            config: { rateLimit: musicRouteRateLimit },
            handler: async (request, reply) => {
                const { guildId } = request.params
                if (!(await authorizeGuildManager(client, request, reply, guildId))) return
                const player = getPlayer(guildId)

                if (!player || !player.playing) {
                    return reply.code(400).send({ message: '目前沒有在播放音樂' })
                }

                if (!player.paused) {
                    return reply.code(400).send({ message: '音樂沒有在暫停狀態' })
                }

                await player.resume()
                reply.send({ ok: true })
            }
        })

        fastify.delete<MusicParams>({
            url: '/api/guilds/:guildId/music/queue',
            config: { rateLimit: musicRouteRateLimit },
            handler: async (request, reply) => {
                const { guildId } = request.params
                if (!(await authorizeGuildManager(client, request, reply, guildId))) return
                const player = getPlayer(guildId)

                if (!player) {
                    return reply.code(400).send({ message: '目前沒有在播放音樂' })
                }

                player.destroy()
                reply.send({ ok: true })
            }
        })
}
