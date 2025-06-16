import type { EventType } from '@/typings/event'
import { Guild } from 'discord.js'
import mongoose from 'mongoose'
import AFKSystem from '../../Structures/Schemas/AFKSystem'
import AntiAlt from '../../Structures/Schemas/AntiAlt'
import GiveawayDB from '../../Structures/Schemas/Giveaway'
import GiveawayHistory from '../../Structures/Schemas/GiveawayHistory'
import GiveawayNotification from '../../Structures/Schemas/GiveawayNotification'
import GiveawayStats from '../../Structures/Schemas/GiveawayStats'
import MusicDB from '../../Structures/Schemas/MusicDB'

export default {
    name: 'guildDelete',
    async execute(client, guild: Guild) {
        const deleteRecords = async (model: mongoose.Model<any>) => {
            const record = await model.findOne({ GuildID: guild.id })
            if (record) {
                await model
                    .deleteMany({ GuildID: guild.id })
                    .exec()
                    .then((count) => {
                        console.log(
                            `[event.guildDelete] 成功從資料庫 ${mongoose.connection.db!.databaseName} 刪除 ${count.deletedCount} 筆資料!`
                        )
                    })
            } else {
                await model
                    .deleteMany({ guildId: guild.id })
                    .exec()
                    .then((count) => {
                        console.log(
                            `[event.guildDelete] 成功從資料庫 ${mongoose.connection.db!.databaseName} 刪除 ${count.deletedCount} 筆資料!`
                        )
                    })
            }
        }

        await Promise.all([
            deleteRecords(MusicDB),
            deleteRecords(AntiAlt),
            deleteRecords(AFKSystem),
            deleteRecords(GiveawayDB),
            deleteRecords(GiveawayHistory),
            deleteRecords(GiveawayStats),
            deleteRecords(GiveawayNotification)
        ]).catch((err) => {
            console.error('[event.guildDelete] 刪除資料庫資料時發生錯誤:', err)
        })
    }
} satisfies EventType
