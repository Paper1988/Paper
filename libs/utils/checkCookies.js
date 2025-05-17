const fs = require('fs')
const path = require('path')
const youtubeCookies = require('./youtubeCookies')

const logFile = path.join(__dirname, 'logs/cookieCheck.log')
const logRetentionDays = 30

/**
 * 檢查 Cookie 狀態，寫入 Log，並通知用戶
 */
async function checkAndNotify(client) {
    const status = youtubeCookies.getStatus() // 取得 Cookies 狀態
    const logData = {
        timestamp: new Date().toISOString(),
        cookiesValid: status.isValid,
        lastUpdate: status.lastUpdate || '未知',
        loginCookieExpires: status.loginCookieExpires || '未知'
    }

    // **格式化 Log 訊息**
    fs.appendFileSync(logFile, JSON.stringify(logData, null, 2) + ',\n')
    console.table(logData) // 輸出整齊表格

    // **通知使用者**
    await youtubeCookies.notifyExpiration(client, status)

    // **清理舊 Log**
    cleanOldLogs()
}

/**
 * 清理超過 30 天的 Log
 */
function cleanOldLogs() {
    if (fs.existsSync(logFile)) {
        const logs = fs.readFileSync(logFile, 'utf8').split('},\n')
        const filteredLogs = logs.filter((log) => {
            const match = log.match(/"timestamp":\s*"([^"]+)"/)
            if (match) {
                const logDate = new Date(match[1])
                return Date.now() - logDate.getTime() < logRetentionDays * 24 * 60 * 60 * 1000
            }
            return false
        })

        fs.writeFileSync(logFile, filteredLogs.join('},\n') + '},\n')
        console.log('✅ 已清理超過 30 天的 Log 記錄')
    }
}

// **匯出函式，讓 ready 事件使用**
module.exports = { checkAndNotify }
