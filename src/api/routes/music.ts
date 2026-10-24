import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import type { FastifyInstance, FastifyRequest } from 'fastify'
import { authorizeGuildManager } from '../authorization.js'

export function registerMusicRoutes(fastify: FastifyInstance, client: PaperClient) {
        type MusicParams = { Params: { guildId: string } }

        const getPlayer = (guildId: string) => {
            const player = client.moonlink?.players.get(guildId)
            if (!player) return null
            return player
        }

        fastify.get<MusicParams>(
            '/api/guilds/:guildId/music/queue',
            async (request, reply) => {
                const { guildId } = request.params
                if (!(await authorizeGuildManager(request, reply, guildId))) return
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
        )

        fastify.post<MusicParams>(
            '/api/guilds/:guildId/music/skip',
            async (request, reply) => {
                const { guildId } = request.params
                if (!(await authorizeGuildManager(request, reply, guildId))) return
                const player = getPlayer(guildId)

                if (!player || !player.playing) {
                    return reply.code(400).send({ message: '目前沒有在播放音樂' })
                }

                await player.skip()
                reply.send({ ok: true })
            }
        )

        fastify.post<MusicParams>(
            '/api/guilds/:guildId/music/pause',
            async (request, reply) => {
                const { guildId } = request.params
                if (!(await authorizeGuildManager(request, reply, guildId))) return
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
        )

        fastify.post<MusicParams>(
            '/api/guilds/:guildId/music/resume',
            async (request, reply) => {
                const { guildId } = request.params
                if (!(await authorizeGuildManager(request, reply, guildId))) return
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
        )

        fastify.delete<MusicParams>(
            '/api/guilds/:guildId/music/queue',
            async (request, reply) => {
                const { guildId } = request.params
                if (!(await authorizeGuildManager(request, reply, guildId))) return
                const player = getPlayer(guildId)

                if (!player) {
                    return reply.code(400).send({ message: '目前沒有在播放音樂' })
                }

                player.destroy()
                reply.send({ ok: true })
            }
        )
}
