import { timingSafeEqual } from 'node:crypto'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { Logger } from '@/libs/utils/logger.js'
import fastifyCors from '@fastify/cors'
import Fastify, { type FastifyInstance } from 'fastify'
import { registerCoreRoutes } from './routes/core.js'
import { registerGiveawayRoutes } from './routes/giveaways.js'
import { registerMusicRoutes } from './routes/music.js'

export class ApiServer {
    private fastify: FastifyInstance

    constructor(client: PaperClient) {
        this.fastify = Fastify({ logger: true })
        this.setupCors()
        this.setupAuthentication()
        registerCoreRoutes(this.fastify, client)
        registerGiveawayRoutes(this.fastify, client)
        registerMusicRoutes(this.fastify, client)
    }

    private setupCors() {
        this.fastify.register(fastifyCors, {
            origin: [process.env.GO_API_URL ?? 'http://localhost:8080'],
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true
        })
    }

    /** Protect internal endpoints with a server-to-server Bearer secret. */
    private setupAuthentication() {
        this.fastify.addHook('onRequest', async (request, reply) => {
            if (request.method === 'OPTIONS') return

            const publicPaths = new Set(['/health', '/api/bot-status'])
            if (publicPaths.has(request.url.split('?')[0] ?? '')) return

            const expectedSecret = process.env.PAPER_API_SECRET
            if (!expectedSecret) {
                this.fastify.log.error('PAPER_API_SECRET is not configured')
                return reply.code(503).send({ message: 'API authentication is not configured' })
            }

            const authorization = request.headers.authorization
            const suppliedSecret =
                typeof authorization === 'string' && authorization.startsWith('Bearer ')
                    ? authorization.slice('Bearer '.length)
                    : ''
            const expected = Buffer.from(expectedSecret)
            const supplied = Buffer.from(suppliedSecret)

            if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
                return reply.code(401).send({ message: 'Unauthorized' })
            }
        })
    }

    async start() {
        const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3001
        const host = '0.0.0.0'

        try {
            await this.fastify.listen({ port, host })
            Logger.info(`機器人的 API 伺服器在： ${host}:${port}`)
            Logger.info(`環境： ${process.env.NODE_ENV || 'development'}`)
        } catch (error) {
            this.fastify.log.error(error)
            throw error
        }
    }
}
