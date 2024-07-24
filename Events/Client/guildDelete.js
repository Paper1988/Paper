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
        const GiveawayDB = require('../../Structures/Schemas/GiveawayDB')

        await MusicDB.deleteOne({ GuildID: guild.id })
        await AntiAlt.deleteOne({ GuildID: guild.id })
        await AFKSystem.deleteOne({ GuildID: guild.id })
        await GiveawayDB.deleteOne({ guildId: guild.id })
    }
}
