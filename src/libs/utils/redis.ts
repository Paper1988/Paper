import IORedis from 'ioredis'
import { Logger } from '@/libs/utils/logger.js'

export interface CacheClient {
    get(key: string): Promise<string | null>
    setex(key: string, ttlSeconds: number, value: string): Promise<unknown>
    del(key: string): Promise<unknown>
}

class InMemoryCache implements CacheClient {
    private store = new Map<string, { value: string; expireAt: number }>()
    private cleanupInterval: NodeJS.Timeout

    constructor() {
        // 定期清理過期項目
        this.cleanupInterval = setInterval(() => {
            this.cleanup()
        }, 60000) // 每分鐘清理一次
    }

    private cleanup(): void {
        const now = Date.now()
        for (const [key, record] of this.store.entries()) {
            if (now > record.expireAt) {
                this.store.delete(key)
            }
        }
    }

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
        this.store.set(key, {
            value,
            expireAt: Date.now() + ttlSeconds * 1000
        })
    }

    async del(key: string): Promise<void> {
        this.store.delete(key)
    }

    // 清理資源
    destroy(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval)
        }
        this.store.clear()
    }
}

// 改用 factory pattern 避免全域狀態
class CacheManager {
    private client: CacheClient | null = null
    private isRedisAvailable = true

    private createRedisClient(): CacheClient | null {
        try {
            // 動態 import 避免 require
            const url = process.env.REDIS_URL
            const redis = url ? new IORedis(url) : new IORedis()

            redis.on('error', (err: unknown) => {
                Logger.error('Redis 連線錯誤:', err)
                this.isRedisAvailable = false
            })

            redis.on('connect', () => {
                Logger.info('Redis 連線成功')
                this.isRedisAvailable = true
            })

            Logger.info('Redis 客戶端已創建')
            return redis as unknown as CacheClient
        } catch (error) {
            Logger.info('無法創建 Redis 客戶端，使用記憶體快取')
            this.isRedisAvailable = false
            return null
        }
    }

    getClient(): CacheClient {
        if (!this.client) {
            const redisClient = this.createRedisClient()
            this.client = redisClient || new InMemoryCache()
        }

        // 如果 Redis 不可用，切換到記憶體快取
        if (!this.isRedisAvailable && !(this.client instanceof InMemoryCache)) {
            Logger.info('切換到記憶體快取')
            this.client = new InMemoryCache()
        }

        return this.client
    }

    async disconnect(): Promise<void> {
        if (!this.client) return

        if (this.client instanceof InMemoryCache) {
            this.client.destroy()
        } else {
            const redis = this.client as IORedis
            await redis.quit().catch(() => redis.disconnect())
        }

        this.client = null
    }
}

// 單例實例
const cacheManager = new CacheManager()

function getClient(): CacheClient {
    return cacheManager.getClient()
}

export async function cacheSetJsonWithTTL(
    key: string,
    value: unknown,
    ttlSeconds: number
): Promise<void> {
    try {
        const payload = JSON.stringify(value)
        await getClient().setex(key, ttlSeconds, payload)
    } catch (error) {
        Logger.error('快取寫入失敗:', error)
        throw error
    }
}

export async function cacheSetRawWithTTL(
    key: string,
    rawValue: string,
    ttlSeconds: number
): Promise<void> {
    try {
        await getClient().setex(key, ttlSeconds, rawValue)
    } catch (error) {
        Logger.error('快取寫入失敗:', error)
        throw error
    }
}

export async function cacheGetJson<T = unknown>(key: string): Promise<T | null> {
    try {
        const raw = await getClient().get(key)
        if (!raw) return null

        return JSON.parse(raw) as T
    } catch (error) {
        Logger.error('快取讀取失敗:', error)
        return null
    }
}

export async function cacheDel(key: string): Promise<void> {
    try {
        await getClient().del(key)
    } catch (error) {
        Logger.error('快取刪除失敗:', error)
        throw error
    }
}

export async function cacheDisconnect(): Promise<void> {
    await cacheManager.disconnect()
}
