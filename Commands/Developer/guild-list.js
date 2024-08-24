const {
    SlashCommandBuilder,
    EmbedBuilder,
    AttachmentBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    Client
} = require('discord.js')

module.exports = {
    developer: true,
    data: new SlashCommandBuilder()
        .setName('guildlist')
        .setDescription('顯示機器人的伺服器排行(僅限開發人員)'),
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     * @returns
     */
    async execute(interaction, client) {
        const guilds = client.guilds.cache.sort((a, b) => b.memberCount - a.memberCount).first(10)

        const description = guilds
            .map((guild, index) => {
                return `${index + 1}) ${
                    guild.name.length >= 20 ? `${guild.name.slice(0, 20)}...` : guild.name
                } -> ${guild.memberCount} 位成員`
            })
            .join('\n')

        const embed = new EmbedBuilder()
            .setTitle('伺服器排行')
            .setDescription(
                `順序 | 名稱 | 成員數\n` +
                    description +
                    `\n\n所有成員: ${client.guilds.cache.reduce(
                        (a, b) => a + b.memberCount,
                        0
                    )}\n所有伺服器: ${client.guilds.cache.size}`
            )
            .setColor('Aqua')

        const button = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('guildlist')
                .setStyle(ButtonStyle.Success)
                .setLabel('List')
                .setEmoji('📃')
        )

        interaction.reply({ embeds: [embed], components: [button], ephemeral: true })

        const collect = interaction.channel.createMessageComponentCollector({})

        collect.on('collect', async (i) => {
            const guilds = client.guilds.cache.sort((a, b) => b.memberCount - a.memberCount)

            const description = guilds
                .map((guild) => {
                    // console.log(guild);
                    return `${guild.name} -> ${guild.memberCount} 位成員`
                })
                .join('\n')
            const output = new AttachmentBuilder(Buffer.from(description), { name: 'servers.txt' })

            await i.reply({ files: [output], ephemeral: true })
        })
    }
}
