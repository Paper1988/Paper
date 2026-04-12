import MusicDB from '@/Structures/Schemas/MusicDB.js'
import { Guild } from 'discord.js'

// ==================== Types ====================

export interface GuildMusicSettings {
    volume: number
    repeatMode: 'off' | 'track' | 'queue'
    autoplay: boolean
}

const REPEAT_MODE_MAP: Record<number, GuildMusicSettings['repeatMode']> = {
    0: 'off',
    1: 'track',
    2: 'queue'
}

// ==================== MusicRepository ====================

export class MusicRepository {
    /**
     * 從資料庫讀取伺服器的音樂設定
     * 若無記錄則回傳預設值
     */
    static async fetchGuildSettings(guild: Guild | string): Promise<GuildMusicSettings> {
        const db = await MusicDB.findOne({
            GuildID: typeof guild === 'string' ? guild : guild.id
        })

        if (!db) return { volume: 50, repeatMode: 'off', autoplay: false }

        return {
            volume: db.volume,
            repeatMode: REPEAT_MODE_MAP[db.repeatMode as number] ?? 'off',
            autoplay: db.autoplay
        }
    }
}

export default MusicRepository
