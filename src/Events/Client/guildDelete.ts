import { Logger } from '@/libs/utils/logger.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import AFKSystem from '@/Structures/Schemas/AFKSystem.js'
import AntiAlt from '@/Structures/Schemas/AntiAlt.js'
import GiveawayDB from '@/Structures/Schemas/Giveaway.js'
import GiveawayHistory from '@/Structures/Schemas/GiveawayHistory.js'
import GiveawayNotification from '@/Structures/Schemas/GiveawayNotification.js'
import GiveawayStats from '@/Structures/Schemas/GiveawayStats.js'
import MusicDB from '@/Structures/Schemas/MusicDB.js'
import type { EventType } from '@/typings/event'
import type { Guild } from 'discord.js'
import type mongoose from 'mongoose'

const CLEANUP_MODELS = [
    MusicDB,
    AntiAlt,
    AFKSystem,
    GiveawayDB,
    GiveawayHistory,
    GiveawayStats,
    GiveawayNotification
]

export default {
    name: 'guildDelete',
    async execute(_client: PaperClient, guild: Guild) {
        const deleteRecords = async (model: mongoose.Model<any>) => {
            const { deletedCount } = await model
                .deleteMany({ $or: [{ GuildID: guild.id }, { guildId: guild.id }] })
                .exec()

            if (deletedCount > 0) {
                Logger.info(
                    `[event.guildDelete] 成功從資料庫 ${model.modelName} 刪除 ${deletedCount} 筆資料!`
                )
            }
        }

        await Promise.all(CLEANUP_MODELS.map(deleteRecords)).catch((err) => {
            Logger.error('[event.guildDelete] 刪除資料庫資料時發生錯誤:', err)
        })
    }
} satisfies EventType
