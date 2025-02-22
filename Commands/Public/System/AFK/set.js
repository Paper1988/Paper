const { EmbedBuilder, ChatInputCommandInteraction, MessageFlags } = require('discord.js')
const DB = require('../../../../Structures/Schemas/AFKSystem')

module.exports = {
    subCommand: 'afk.set',
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const { guild, options, user, createdTimestamp } = interaction

        const Embed = new EmbedBuilder().setAuthor({
            name: user.tag,
            iconURL: user.displayAvatarURL()
        })

        const afkStatus = options.getString('status')

        await DB.findOneAndUpdate(
            { GuildID: guild.id, UserID: user.id },
            { Status: afkStatus, Time: parseInt(createdTimestamp / 1000) },
            { new: true, upsert: true }
        )

        Embed.setColor('Green').setDescription(
            `<:correct:1265560254708711467> | 你的afk狀態已被設置為: \`${afkStatus}\``
        )
        return interaction.reply({ embeds: [Embed], flags: MessageFlags.Ephemeral })
    }
}
