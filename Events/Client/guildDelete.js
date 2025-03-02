const { Guild } = require('discord.js')
const mongoose = require('mongoose')

module.exports = {
    name: 'guildDelete',
    /**
     *
     * @param {Guild} guild
     */
    async execute(guild) {
        const MusicDB = require('../../Structures/Schemas/MusicDB')
        const AntiAlt = require('../../Structures/Schemas/AntiAlt')
        const AFKSystem = require('../../Structures/Schemas/AFKSystem')
        const GiveawayDB = require('../../Structures/Schemas/Giveaway')
        const GiveawayHistory = require('../../Structures/Schemas/GiveawayHistory')
        const GiveawayStats = require('../../Structures/Schemas/GiveawayStats')
        const GiveawayNotification = require('../../Structures/Schemas/GiveawayNotification')

        const deleteRecords = async (model) => {
            await model.deleteMany({ GuildID: guild.id }).then((count) => {
                console.log(
                    `[event.guildDelete] 成功從資料庫 ${mongoose.connection.db.databaseName} 刪除 ${count.deletedCount} 筆資料!`
                )
            })
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
}
