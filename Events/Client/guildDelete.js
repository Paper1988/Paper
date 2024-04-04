const { Guild } = require('discord.js')

const MusicDB = require('../../Structures/Schemas/MusicDB.js')

module.exports = {
    name: 'guildDelete',
    /**
     *
     * @param {Guild} guild
     */
    async execute(guild) {
        const data = await MusicDB.findOne({ GuildId: guild.id })

        if (data) await data.deleteOne({ GuildId: guild.id })
    }
}
