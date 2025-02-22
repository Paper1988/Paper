const { EmbedBuilder, ChatInputCommandInteraction, MessageFlags } = require('discord.js')
const DB = require('../../../../Structures/Schemas/AFKSystem')

module.exports = {
    subCommand: 'afk.return',
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const { guild, user } = interaction

        const Embed = new EmbedBuilder().setAuthor({
            name: user.tag,
            iconURL: user.displayAvatarURL()
        })

        await DB.deleteOne({ GuildID: guild.id, UserID: user.id })
            .exec()
            .catch(() => {})

        Embed.setColor('Red').setDescription(`<:correct:1265560254708711467> | 你的afk狀態已被移除`)
        return interaction.reply({ embeds: [Embed], flags: MessageFlags.Ephemeral })
    }
}
