const { AttachmentBuilder, MessageFlags } = require('discord.js')

module.exports = {
    id: 'guildlist',
    async execute(interaction, client) {
        const guilds = client.guilds.cache.sort((a, b) => b.memberCount - a.memberCount)

        const description = guilds
            .map((guild) => {
                // console.log(guild);
                return `${guild.name} -> ${guild.memberCount} 位成員`
            })
            .join('\n')
        const output = new AttachmentBuilder(Buffer.from(description), {
            name: 'servers.txt'
        })

        await interaction.reply({ files: [output], flags: MessageFlags.Ephemeral })
    }
}
