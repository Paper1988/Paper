import { PaperClient } from '@/classes/PaperClient.js'
import youtubeCookies from '@/libs/utils/youtubeCookies.js'
// 移除 fs, path
import fetch from 'node-fetch'

// 你可以在這裡填入你的 Discord Webhook URL
const DISCORD_WEBHOOK_URL =
    '***REMO$'

/**
 * 發送 logData 到 Discord Webhook
 */
async function sendLogToDiscord(logData: any) {
    const content =
        `【YouTube Cookies 狀態通知】\n` +
        `有效: ${logData.cookiesValid ? '✅' : '❌'}\n` +
        `最後更新: ${logData.lastUpdate}\n` +
        `登入 Cookie 到期: ${new Date(logData.loginCookieExpires * 1000).toLocaleString('zh-TW')}\n` +
        `時間: ${logData.timestamp}`
    await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
    })
}

/**
 * 檢查 Cookie 狀態，發送到 Discord Webhook，並通知用戶
 */
async function checkAndNotify(client: PaperClient) {
    const status = youtubeCookies.getStatus() // 取得 Cookies 狀態
    const logData = {
        timestamp: new Date().toISOString(),
        cookiesValid: status.isValid,
        lastUpdate: status.lastUpdate || '未知',
        loginCookieExpires: status.loginCookieExpires || '未知'
    }

    // 發送到 Discord Webhook
    await sendLogToDiscord(logData)
    console.table(logData) // 輸出整齊表格

    // 通知使用者
    await youtubeCookies.notifyExpiration(client, status)
}

// 匯出函式，讓 ready 事件使用
export { checkAndNotify }
