import { glob } from 'glob'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

function getFileUrl(filePath: string): string {
    // 檢查是否已經是 URL 格式
    if (filePath.startsWith('file://')) {
        return filePath
    }

    try {
        // 嘗試轉換為 file:// URL
        return pathToFileURL(filePath).href
    } catch (err) {
        // 如果轉換失敗，返回原始路徑
        console.warn(`無法將路徑轉換為 URL: ${filePath}`)
        return filePath
    }
}

export async function loadFiles(dirName: string): Promise<string[]> {
    try {
        // 使用 import.meta.url 來獲取當前文件的路徑
        const __filename = fileURLToPath(import.meta.url)
        const __dirname = path.dirname(__filename)

        // 修改路徑，確保指向 src 目錄
        const baseDir = path.join(__dirname, '..', '..')
        const searchPath = path.join(baseDir, dirName, '**/*.{js,ts}').replace(/\\/g, '/')

        /* console.log('搜尋路徑:', searchPath) */

        const files = await glob(searchPath)
        /* console.log('找到的檔案:', files) */

        if (files.length === 0) {
            console.warn(`警告: 在 ${dirName} 目錄中沒有找到任何檔案`)
            return []
        }

        const validFiles = files.filter((file) => {
            const ext = path.extname(file).toLowerCase()
            return ['.ts', '.js'].includes(ext)
        })

        if (validFiles.length === 0) {
            console.warn(`警告: 在 ${dirName} 目錄中沒有找到有效的 .ts 或 .js 檔案`)
            return []
        }

        // 根據環境返回適當的文件路徑
        return validFiles.map((file) => {
            // 在 Railway 或其他雲端平台上，使用相對路徑
            if (process.env.NODE_ENV === 'production') {
                return file
            }
            // 在本地開發環境，使用 file:// URL
            return getFileUrl(file)
        })
    } catch (err) {
        console.error(`從資料夾 ${dirName} 載入檔案時發生錯誤:`)
        console.error('錯誤詳情:', err)
        throw err
    }
}
