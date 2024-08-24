const { Message, EmbedBuilder } = require('discord.js')
const DB = require('../../Structures/Schemas/AFKSystem')

module.exports = {
    name: 'messageCreate',
    /**
     * @param {Message} message
     */
    async execute(message) {
        if (message.author.bot) return

        await DB.deleteOne({
            GuildID: message.guild.id,
            UserID: message.author.id
        })
            .exec()
            .catch(() => {})

        if (message.mentions.members.size) {
            const Embed = new EmbedBuilder().setColor('Red')
            message.mentions.members.forEach((m) => {
                DB.findOne({ GuildID: message.guild.id, UserID: m.id })
                    .exec()
                    .then(async (data) => {
                        if (data)
                            return message.reply({
                                embeds: [
                                    Embed.setDescription(
                                        `<:idle_860123644265365514:1202228021826961448> | ${m} 已進入AFK模式\nAfk時間: <t:${data.Time}:R>\n **狀態**: ${data.Status}`
                                    )
                                ]
                            })
                    })
            })
        }
    }
}
