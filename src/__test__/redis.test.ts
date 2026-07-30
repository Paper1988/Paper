import { expect } from 'chai'
import dotenv from 'dotenv'
import fs from 'fs'
import IORedis from 'ioredis'
import { after, before, describe, it } from 'mocha'

if (fs.existsSync('.env.local')) {
    dotenv.config({ path: '.env.local' })
} else {
    dotenv.config()
}

const { cacheSetJsonWithTTL, cacheSetRawWithTTL, cacheGetJson, cacheDel, cacheDisconnect } =
    await import('@/libs/utils/redis.js')

describe('Redis Cache Tests', function () {
    this.timeout(10000)

    const testKey = 'test:mocha'
    const testData = {
        message: 'Hello from Mocha',
        timestamp: Date.now(),
        nested: { value: 123 }
    }

    const testKeys = new Set<string>([testKey])
    let usingRealRedis = false

    function trackKey(key: string): string {
        testKeys.add(key)
        return key
    }

    before(async function () {
        if (process.env.REDIS_URL) {
            const client = new IORedis(process.env.REDIS_URL, {
                maxRetriesPerRequest: 1,
                connectTimeout: 5000
            })
            try {
                await client.ping()
                usingRealRedis = true
            } catch {
                usingRealRedis = false
            } finally {
                await client.quit().catch(() => {})
            }
        }

        console.log(
            usingRealRedis
                ? '使用 Redis 後端執行測試'
                : 'Redis 不可用，使用 InMemoryCache 後端執行測試'
        )

        await cacheDel(testKey).catch(() => {})
    })

    after(async function () {
        await Promise.all([...testKeys].map((key) => cacheDel(key).catch(() => {})))
        await cacheDisconnect()
    })

    describe('基本功能測試', function () {
        it('應該能成功寫入和讀取 JSON 數據', async function () {
            await cacheSetJsonWithTTL(testKey, testData, 300)

            const result = await cacheGetJson(testKey)

            expect(result).to.deep.equal(testData)
        })

        it('應該能正確處理不存在的 key', async function () {
            const result = await cacheGetJson('non:existent:key')
            expect(result).to.be.null
        })

        it('應該能刪除數據', async function () {
            const key = trackKey(testKey + ':delete')

            await cacheSetJsonWithTTL(key, { test: 'delete' }, 60)

            let result = await cacheGetJson(key)
            expect(result).to.not.be.null

            await cacheDel(key)

            result = await cacheGetJson(key)
            expect(result).to.be.null
        })
    })

    describe('數據類型測試', function () {
        it('應該能處理字符串', async function () {
            const key = trackKey(testKey + ':string')
            const testString = 'Hello Redis'

            await cacheSetJsonWithTTL(key, testString, 60)
            const result = await cacheGetJson(key)

            expect(result).to.equal(testString)
        })

        it('應該能處理數字', async function () {
            const key = trackKey(testKey + ':number')
            const testNumber = 12345

            await cacheSetJsonWithTTL(key, testNumber, 60)
            const result = await cacheGetJson(key)

            expect(result).to.equal(testNumber)
        })

        it('應該能處理陣列', async function () {
            const key = trackKey(testKey + ':array')
            const testArray = [1, 2, 'three', { four: 4 }]

            await cacheSetJsonWithTTL(key, testArray, 60)
            const result = await cacheGetJson(key)

            expect(result).to.deep.equal(testArray)
        })

        it('應該能處理複雜物件', async function () {
            const key = trackKey(testKey + ':complex')
            const complexObject = {
                id: 1,
                user: { name: 'John', age: 30 },
                tags: ['test', 'redis'],
                metadata: {
                    created: new Date().toISOString(),
                    version: '1.0'
                }
            }

            await cacheSetJsonWithTTL(key, complexObject, 60)
            const result = await cacheGetJson(key)

            expect(result).to.deep.equal(complexObject)
        })
    })

    describe('業務用法測試', function () {
        it('應該能快取 blacklist 的 miss 哨兵值', async function () {
            const key = trackKey('blacklist:user:test-user')
            const missEntry = { miss: true as const }

            await cacheSetJsonWithTTL(key, missEntry, 60)

            const cached = await cacheGetJson<{ miss: true } | { Reason?: string }>(key)

            expect(cached).to.deep.equal(missEntry)
            expect(cached && 'miss' in cached).to.be.true
        })

        it('應該能快取 blacklist 命中資料', async function () {
            const key = trackKey('blacklist:guild:test-guild')
            const entry = { Reason: 'spam', Time: Date.now() }

            await cacheSetJsonWithTTL(key, entry, 60)

            const cached = await cacheGetJson<{ Reason?: string; Time?: number }>(key)

            expect(cached).to.deep.equal(entry)
            expect(cached && 'miss' in cached).to.be.false
        })

        it('應該能快取 music track 資料', async function () {
            const key = trackKey('music:track:test-user:test-search')
            const track = {
                title: 'Test Track',
                author: 'Test Artist',
                uri: 'https://example.com/track'
            }

            await cacheSetJsonWithTTL(key, track, 60)

            let cached = await cacheGetJson<typeof track>(key)
            expect(cached).to.deep.equal(track)

            await cacheDel(key)
            cached = await cacheGetJson<typeof track>(key)
            expect(cached).to.be.null
        })
    })

    describe('TTL 測試', function () {
        it('應該能設定短 TTL', async function () {
            const key = trackKey(testKey + ':ttl')

            await cacheSetJsonWithTTL(key, { test: 'ttl' }, 1)

            let result = await cacheGetJson(key)
            expect(result).to.not.be.null

            await new Promise((resolve) => setTimeout(resolve, 1500))

            result = await cacheGetJson(key)
            expect(result).to.be.null
        })
    })

    describe('錯誤處理測試', function () {
        it('應該能處理無效的 JSON', async function () {
            const key = trackKey(testKey + ':invalid-json')

            await cacheSetRawWithTTL(key, '{not-json', 60)

            const result = await cacheGetJson(key)

            expect(result).to.be.null
        })
    })

    describe('連線測試', function () {
        it('應該能成功執行快取讀寫', async function () {
            const pingKey = trackKey(testKey + ':ping')
            const pingData = { ping: 'pong', time: Date.now() }

            await cacheSetJsonWithTTL(pingKey, pingData, 10)
            const result = await cacheGetJson(pingKey)

            expect(result).to.deep.equal(pingData)

            if (usingRealRedis) {
                console.log('✓ Redis 連線成功')
            } else {
                console.log('✓ InMemoryCache 後備模式運作正常')
            }
        })

        it('應該能處理多個並發請求', async function () {
            const testCount = 10

            const results = await Promise.all(
                Array.from({ length: testCount }, async (_, i) => {
                    const key = trackKey(`${testKey}:concurrent:${i}`)
                    const data = { index: i, value: `test-${i}` }

                    await cacheSetJsonWithTTL(key, data, 60)
                    const actual = await cacheGetJson(key)

                    return { key, expected: data, actual }
                })
            )

            results.forEach(({ key, expected, actual }) => {
                expect(actual).to.deep.equal(expected, `Failed for key: ${key}`)
            })
        })
    })
})
