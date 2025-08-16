import { Logger } from '@/libs/utils/logger.js'

export interface CacheClient {
    get(key: string): Promise<string | null>
    setex(key: string, ttlSeconds: number, value: string): Promise<unknown>
    del(key: string): Promise<unknown>
}

class InMemoryCache implements CacheClient {
    private store = new Map<string, { value: string; expireAt: number }>()

    async get(key: string): Promise<string | null> {
        const record = this.store.get(key)
        if (!record) return null
        if (Date.now() > record.expireAt) {
            this.store.delete(key)
            return null
        }
        return record.value
    }

    async setex(key: string, ttlSeconds: number, value: string): Promise<void> {
        this.store.set(key, { value, expireAt: Date.now() + ttlSeconds * 1000 })
    }

    async del(key: string): Promise<void> {
        this.store.delete(key)
    }
}

let client: CacheClient | null = null

function createRedisClient(): CacheClient {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const IORedis = require('ioredis')

        const url = process.env.REDIS_URL
        const redis = url ? new IORedis(url) : new IORedis()

        redis.on('error', (err: unknown) => {
            Logger.error('Redis 連線錯誤，改用記憶體快取:', err)
            client = new InMemoryCache()
        })

        Logger.info('Redis 已初始化')
        return redis as unknown as CacheClient
    } catch {
        Logger.info('未安裝 ioredis 或無法建立連線，使用記憶體快取')
        return new InMemoryCache()
    }
}

function getClient(): CacheClient {
    if (!client) client = createRedisClient()
    return client
}

export async function cacheSetJsonWithTTL(key: string, value: unknown, ttlSeconds: number) {
    const payload = JSON.stringify(value)
    await getClient().setex(key, ttlSeconds, payload)
}

export async function cacheGetJson<T = unknown>(key: string): Promise<T | null> {
    const raw = await getClient().get(key)
    if (!raw) return null
    try {
        return JSON.parse(raw) as T
    } catch {
        return null
    }
}

export async function cacheDel(key: string) {
    await getClient().del(key)
}
