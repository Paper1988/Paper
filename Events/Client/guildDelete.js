const { Guild } = require('discord.js')

const MusicDB = require('../../Structures/Schemas/MusicDB')
const AntiAlt = require('../../Structures/Schemas/AntiAlt')
const AFKSystem = require('../../Structures/Schemas/AFKSystem')
const GiveawayDB = require('../../Structures/Schemas/GiveawayDB')

module.exports = {
    name: 'guildDelete',
    /**
     *
     * @param {Guild} guild
     */
    async execute(guild) {
        return [
            await MusicDB.findOne({ GuildId: guild.id }),
            await AntiAlt.findOne({ GuildID: guild.id }),
            await AFKSystem.findOne({ GuildId: guild.id }),
            await GiveawayDB.findOne({ GuildId: guild.id })
        ].forEach((database) => {
            deleteData(database)
        })

        async function deleteData(database) {
            try {
                database.deleteOne({ GuildId: guild.id })
            } catch (error) {
                console.error('無法刪除資料庫檔案:', error)
            }
        }
    }
}
