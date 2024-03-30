const { ChatInputCommandInteraction, Client, EmbedBuilder } = require('discord.js')

const MusicDB = require('../../Structures/Schemas/MusicDB.js')

module.exports = {
    name: 'guildDelete',
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const { guild } = interaction

        const data = await MusicDB.findOne({ GuildId: guild.id })

        if (data) await data.deleteOne({ GuildId: guild.id })
    }
}
