const fs = require('fs');
const path = require('path');

class CookieManager {
    constructor() {
        this.cookiesPath = path.join(__dirname, 'cookies.json');
        this.cookies = this.loadCookies();
    }

    loadCookies() {
        try {
            return JSON.parse(fs.readFileSync(this.cookiesPath, 'utf8'));
        } catch (error) {
            console.error('無法讀取 cookies 文件: ', error);
            return [];
        }
    }

    updateCookies(newCookies) {
        try {
            const formattedCookies = JSON.stringify(newCookies, null, 4);
            fs.writeFileSync(this.cookiesPath, formattedCookies);
            this.cookies = JSON.parse(formattedCookies);
            return true;
        } catch (error) {
            console.error('更新 cookies 失敗: ', error);
            return false;
        }
    }

    formatExistingFile() {
        try {
            const currentCookies = this.loadCookies();
            return this.updateCookies(currentCookies);
        } catch (error) {
            console.error('格式化 cookies 文件失敗: ', error);
            return false;
        }
    }

    getCookies() {
        return this.cookies;
    }

    // 檢查 cookies 是否過期
    checkExpiration() {
        const now = Date.now() / 1000; // 轉換為秒
        const expiredCookies = this.cookies.filter(cookie => 
            cookie.expirationDate && cookie.expirationDate < now
        );

        if (expiredCookies.length > 0) {
            console.warn('發現過期的 cookies，請更新');
            // 這裡可以加入通知管理員的邏輯
        }
    }
}

module.exports = new CookieManager(); 