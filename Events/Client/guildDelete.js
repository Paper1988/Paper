const { Guild } = require('discord.js')

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

        await MusicDB.deleteOne({ GuildID: guild.id })
            .exec()
            .catch(() => {})
        await AntiAlt.deleteOne({ GuildID: guild.id })
            .exec()
            .catch(() => {})
        await AFKSystem.deleteOne({ GuildID: guild.id })
            .exec()
            .catch(() => {})
        await GiveawayDB.deleteOne({ guildId: guild.id })
            .exec()
            .catch(() => {})
        await GiveawayHistory.deleteOne({ guildId: guild.id })
            .exec()
            .catch(() => {})
        await GiveawayStats.deleteOne({ guildId: guild.id })
            .exec()
            .catch(() => {})
        await GiveawayNotification.deleteOne({ guildId: guild.id })
            .exec()
            .catch(() => {})
    }
}
