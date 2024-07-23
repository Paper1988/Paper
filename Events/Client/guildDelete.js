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
        await MusicDB.findOneAndDelete({ GuildID: guild.id })
        await AntiAlt.findOneAndDelete({ GuildID: guild.id })
        await AFKSystem.findOneAndDelete({ GuildID: guild.id })
        await GiveawayDB.findOneAndDelete({ guildId: guild.id })
    }
}
