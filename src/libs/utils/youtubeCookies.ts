import { Client } from 'discord.js'
import fs from 'fs'
import path from 'path'

const cookieFile = path.join(process.cwd(), 'src/Structures/cookies.json')

export default {
    getCookies() {
        try {
            if (fs.existsSync(cookieFile)) {
                const cookieData = JSON.parse(fs.readFileSync(cookieFile, 'utf8'))
                // 返回 cookie 陣列
                return cookieData.cookies || [] // 確保返回一個數組
            }
            return []
        } catch (error) {
            console.error('Error reading cookies:', error)
            return []
        }
    },

    saveCookies(cookies: string[]) {
        try {
            const cookieData = {
                cookies: cookies,
                updatedAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() / 1000 + 30 * 24 * 60 * 60).toISOString() // 30天後過期，轉換為秒
            }
            fs.writeFileSync(cookieFile, JSON.stringify(cookieData, null, 2))
            return true
        } catch (error) {
            console.error('Error saving cookies:', error)
            return false
        }
    },

    formatExistingFile() {
        try {
            if (fs.existsSync(cookieFile)) {
                const cookieData = JSON.parse(fs.readFileSync(cookieFile, 'utf8'))
                // 確保格式正確
                if (!cookieData.cookies || !Array.isArray(cookieData.cookies)) {
                    cookieData.cookies = []
                }
                if (!cookieData.lastUpdate) {
                    cookieData.lastUpdate = new Date().toISOString()
                }
                fs.writeFileSync(cookieFile, JSON.stringify(cookieData, null, 4))
            } else {
                // 如果文件不存在，創建一個新的
                this.saveCookies([''])
            }
        } catch (error) {
            console.error('Error formatting cookie file:', error)
            // 如果解析失敗，創建一個新的
            this.saveCookies([''])
        }
    },

    checkExpiration() {
        try {
            if (fs.existsSync(cookieFile)) {
                const cookieData = JSON.parse(fs.readFileSync(cookieFile, 'utf8'))
                const now = Math.floor(Date.now() / 1000) // 直接使用秒

                // 檢查必要的 cookies 是否存在且未過期
                const requiredCookies = ['LOGIN_INFO']
                const missingCookies = requiredCookies.filter(
                    (cookieName) =>
                        !cookieData.cookies.some((c: { name: string }) => c.name === cookieName)
                )

                if (missingCookies.length > 0) {
                    console.warn(
                        `Warning: Required YouTube cookies are missing: ${missingCookies.join(', ')}`
                    )
                    return false
                }

                // 檢查是否有任何必要的 cookie 已過期
                const loginCookie = cookieData.cookies.find(
                    (c: { name: string }) => c.name === 'LOGIN_INFO'
                )

                if (loginCookie.expirationDate && loginCookie.expirationDate < now) {
                    console.warn('Warning: LOGIN_INFO cookie has expired')
                    return false
                }

                // 檢查是否快要過期（5天內）
                const fiveDaysFromNow = now + 5 * 24 * 60 * 60 // 5天的秒數
                if (loginCookie.expirationDate < fiveDaysFromNow) {
                    console.warn('Warning: Some YouTube cookies will expire soon')
                    return true
                }

                return true // 所有必要的 cookies 存在且有效
            }
            return false // cookieFile 不存在
        } catch (error) {
            console.error('Error checking cookie expiration:', error)
            return false
        }
    },

    // 新增一個方法來獲取 cookie 狀態
    getStatus() {
        try {
            if (fs.existsSync(cookieFile)) {
                const cookieData = JSON.parse(fs.readFileSync(cookieFile, 'utf8'))
                const loginCookie = cookieData.cookies.find(
                    (c: { name: string }) => c.name === 'LOGIN_INFO'
                )

                return {
                    hasCookies: cookieData.cookies.length > 0,
                    lastUpdate: cookieData.lastUpdate,
                    loginCookieExpires: loginCookie
                        ? Math.floor(loginCookie.expirationDate) // 使用秒格式
                        : null,
                    isValid: this.checkExpiration()
                }
            }
            return {
                hasCookies: false,
                lastUpdate: null,
                loginCookieExpires: null,
                isValid: false
            }
        } catch (error) {
            console.error('Error getting cookie status:', error)
            return {
                hasCookies: false,
                lastUpdate: null,
                loginCookieExpires: null,
                isValid: false
            }
        }
    },

    async notifyExpiration(
        client: Client,
        status: {
            hasCookies: boolean
            lastUpdate: string | null
            loginCookieExpires: number | null
            isValid: boolean
        }
    ) {
        const webhook = await client.fetchWebhook(
            '1348200943795179520',
            'CP_C1vdKJs-ewK8mZTL9eQEZBZdn3lyDW0P6v_Umu80azVg-3QgA5ta-V24U6Bn7oJ9g'
        )

        if (!status.isValid) {
            await webhook.send('⚠️ **你的 YouTube Cookies 已過期！** 請更新 Cookies。')
        } else if (
            new Date(status.loginCookieExpires! * 1000).getTime() - Date.now() <
            5 * 24 * 60 * 60 * 1000
        ) {
            await webhook.send('⏳ **你的 YouTube Cookies 即將在 5 天內過期！** 請盡快更新。')
        }
    }
}
