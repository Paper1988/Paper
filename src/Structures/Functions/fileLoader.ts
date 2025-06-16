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
        console.warn(`無法將路徑轉換為 URL: ${filePath}`, err)
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

        return validFiles.map((file) => {
            if (process.env.NODE_ENV === 'production') {
                return file
            }
            return getFileUrl(file)
        })
    } catch (err) {
        console.error(`從資料夾 ${dirName} 載入檔案時發生錯誤:`)
        console.error('錯誤詳情:', err)
        throw err
    }
}
