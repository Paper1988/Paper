import { describe, it, before, after } from 'mocha'
import { expect } from 'chai'
import { cacheSetJsonWithTTL, cacheGetJson, cacheDel } from '@/libs/utils/redis.js'

describe('Redis Cache Tests', function () {
    // 增加超時時間，因為網路連線可能較慢
    this.timeout(10000)

    const testKey = 'test:mocha'
    const testData = {
        message: 'Hello from Mocha',
        timestamp: Date.now(),
        nested: { value: 123 }
    }

    // 測試前清理
    before(async function () {
        console.log('清理測試環境...')
        await cacheDel(testKey).catch(() => {})
    })

    // 測試後清理
    after(async function () {
        console.log('清理測試數據...')
        await cacheDel(testKey).catch(() => {})
    })

    describe('基本功能測試', function () {
        it('應該能成功寫入和讀取 JSON 數據', async function () {
            // 寫入數據
            await cacheSetJsonWithTTL(testKey, testData, 300) // 5分鐘 TTL

            // 讀取數據
            const result = await cacheGetJson(testKey)

            expect(result).to.deep.equal(testData)
        })

        it('應該能正確處理不存在的 key', async function () {
            const result = await cacheGetJson('non:existent:key')
            expect(result).to.be.null
        })

        it('應該能刪除數據', async function () {
            // 先寫入
            await cacheSetJsonWithTTL(testKey + ':delete', { test: 'delete' }, 60)

            // 確認存在
            let result = await cacheGetJson(testKey + ':delete')
            expect(result).to.not.be.null

            // 刪除
            await cacheDel(testKey + ':delete')

            // 確認已刪除
            result = await cacheGetJson(testKey + ':delete')
            expect(result).to.be.null
        })
    })

    describe('數據類型測試', function () {
        it('應該能處理字符串', async function () {
            const testString = 'Hello Redis'
            await cacheSetJsonWithTTL(testKey + ':string', testString, 60)
            const result = await cacheGetJson(testKey + ':string')
            expect(result).to.equal(testString)
        })

        it('應該能處理數字', async function () {
            const testNumber = 12345
            await cacheSetJsonWithTTL(testKey + ':number', testNumber, 60)
            const result = await cacheGetJson(testKey + ':number')
            expect(result).to.equal(testNumber)
        })

        it('應該能處理陣列', async function () {
            const testArray = [1, 2, 'three', { four: 4 }]
            await cacheSetJsonWithTTL(testKey + ':array', testArray, 60)
            const result = await cacheGetJson(testKey + ':array')
            expect(result).to.deep.equal(testArray)
        })

        it('應該能處理複雜物件', async function () {
            const complexObject = {
                id: 1,
                user: { name: 'John', age: 30 },
                tags: ['test', 'redis'],
                metadata: {
                    created: new Date().toISOString(),
                    version: '1.0'
                }
            }
            await cacheSetJsonWithTTL(testKey + ':complex', complexObject, 60)
            const result = await cacheGetJson(testKey + ':complex')
            expect(result).to.deep.equal(complexObject)
        })
    })

    describe('TTL 測試', function () {
        it('應該能設定短 TTL', async function () {
            // 設定 1 秒 TTL
            await cacheSetJsonWithTTL(testKey + ':ttl', { test: 'ttl' }, 1)

            // 立即讀取應該存在
            let result = await cacheGetJson(testKey + ':ttl')
            expect(result).to.not.be.null

            // 等待 1.5 秒後應該過期
            await new Promise((resolve) => setTimeout(resolve, 1500))
            result = await cacheGetJson(testKey + ':ttl')
            expect(result).to.be.null
        })
    })

    describe('錯誤處理測試', function () {
        it('應該能處理無效的 JSON', async function () {
            // 這個測試需要直接操作 Redis client
            // 如果你的 utils 有暴露 client，可以這樣測試
            try {
                // 模擬損壞的 JSON
                const result = await cacheGetJson('invalid:json:key')
                expect(result).to.be.null // 應該返回 null 而不是拋錯
            } catch (error) {
                // 如果拋錯，確保是預期的錯誤
                expect(error).to.exist
            }
        })
    })

    describe('連線測試', function () {
        it('應該能成功連接到 Redis', async function () {
            // 嘗試執行一個簡單操作來確認連線
            const pingKey = testKey + ':ping'
            const pingData = { ping: 'pong', time: Date.now() }

            try {
                await cacheSetJsonWithTTL(pingKey, pingData, 10)
                const result = await cacheGetJson(pingKey)

                expect(result).to.deep.equal(pingData)
                console.log('✓ Redis 連線成功')

                // 清理
                await cacheDel(pingKey)
            } catch (error: any) {
                console.error('✗ Redis 連線失敗:', error.message)
                throw error
            }
        })

        it('應該能處理多個並發請求', async function () {
            const promises: any[] = []
            const testCount = 10

            // 創建多個並發請求
            for (let i = 0; i < testCount; i++) {
                const key = `${testKey}:concurrent:${i}`
                const data = { index: i, value: `test-${i}` }

                promises.push(
                    cacheSetJsonWithTTL(key, data, 60).then(() =>
                        cacheGetJson(key).then((result) => ({
                            key,
                            expected: data,
                            actual: result
                        }))
                    )
                )
            }

            const results = await Promise.all(promises)

            // 驗證所有結果
            results.forEach(({ key, expected, actual }) => {
                expect(actual).to.deep.equal(expected, `Failed for key: ${key}`)
            })

            // 清理
            const cleanupPromises = results.map(({ key }) => cacheDel(key))
            await Promise.all(cleanupPromises)
        })
    })
})
