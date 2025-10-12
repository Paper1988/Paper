import { Logger } from '@/libs/utils/logger'
import { glob } from 'glob'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

function getFileUrl(filePath: string): string {
    if (filePath.startsWith('file://')) {
        return filePath
    }

    try {
        return pathToFileURL(filePath).href
    } catch (err) {
        Logger.warn(`⚠️ 無法將路徑轉換為 URL: ${filePath}`, err)
        return filePath
    }
}

export async function loadFiles(dirName: string): Promise<string[]> {
    try {
        const __filename = fileURLToPath(import.meta.url)
        const __dirname = path.dirname(__filename)

        const baseDir = path.join(__dirname, '..', '..')
        const searchPath = path.join(baseDir, dirName, '**/*.{js,ts}').replace(/\\/g, '/')

        const files = await glob(searchPath)

        if (files.length === 0) {
            Logger.warn(`⚠️ 警告: 在 ${dirName} 目錄中沒有找到任何檔案`)
            return []
        }

        const validFiles = files.filter((file) => {
            const ext = path.extname(file).toLowerCase()
            const isValid = ['.ts', '.js'].includes(ext)
            if (!isValid) {
                console.log(`排除非有效檔案: ${file}`)
            }
            return isValid
        })

        if (validFiles.length === 0) {
            Logger.warn(`⚠️ 警告: 在 ${dirName} 目錄中沒有找到有效的 .ts 或 .js 檔案`)
            return []
        }

        const fileUrls = validFiles.map((file) => {
            if (process.env.NODE_ENV === 'production') {
                return file
            }
            return getFileUrl(file)
        })

        return fileUrls
    } catch (err) {
        Logger.error(`❌ 從資料夾 ${dirName} 載入檔案時發生錯誤:`)
        Logger.error('❌ 錯誤詳情:', err)
        throw err
    }
}
