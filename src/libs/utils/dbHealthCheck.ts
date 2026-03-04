import mongoose from 'mongoose'
import { Logger } from './logger.js'

/**
 * MongoDB 連線狀態代碼
 * 0 = disconnected
 * 1 = connected
 * 2 = connecting
 * 3 = disconnecting
 */
export const CONNECTION_STATES = {
    0: '斷開連線',
    1: '已連線',
    2: '連線中',
    3: '斷線中'
} as const

/**
 * 檢查資料庫連線健康狀態
 */
export async function checkMongoDBHealth(): Promise<{
    status: 'healthy' | 'connecting' | 'unhealthy'
    details: {
        readyState: number
        readyStateDesc: string
        ping?: number
        error?: string
    }
}> {
    const readyState = mongoose.connection.readyState
    const readyStateDesc = CONNECTION_STATES[readyState] || '未知狀態'

    // 如果已連線，測試 ping
    if (readyState === 1) {
        try {
            const startTime = Date.now()
            // 進行簡單的資料庫操作來測試連線
            if (mongoose.connection.db) {
                await mongoose.connection.db.admin().ping()
                const pingTime = Date.now() - startTime

                return {
                    status: 'healthy',
                    details: {
                        readyState,
                        readyStateDesc,
                        ping: pingTime
                    }
                }
            } else {
                throw new Error('資料庫連線物件不存在')
            }
        } catch (error) {
            return {
                status: 'unhealthy',
                details: {
                    readyState,
                    readyStateDesc,
                    error: error instanceof Error ? error.message : '資料庫 ping 測試失敗'
                }
            }
        }
    }

    // 連線中
    if (readyState === 2) {
        return {
            status: 'connecting',
            details: {
                readyState,
                readyStateDesc
            }
        }
    }

    // 其他狀態視為不健康
    return {
        status: 'unhealthy',
        details: {
            readyState,
            readyStateDesc
        }
    }
}

/**
 * 確保資料庫操作安全執行的包裝器函數
 * 在執行資料庫操作前檢查連線狀態
 */
export async function safeDbOperation<T>(
    operation: () => Promise<T>,
    fallback?: T
): Promise<T | undefined> {
    try {
        // 檢查資料庫連線狀態
        if (mongoose.connection.readyState !== 1) {
            Logger.warn('資料庫未連線，無法執行操作')
            return fallback
        }

        // 執行資料庫操作
        return await operation()
    } catch (error: any) {
        Logger.error(error, '❌資料庫操作失敗:')
        return fallback
    }
}
