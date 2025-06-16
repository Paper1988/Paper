import DB from '@/Structures/Schemas/AFKSystem'
import { EmbedBuilder, Message } from 'discord.js'

export default {
    name: 'messageCreate',
    async execute(message: Message) {
        if (!message.author || message.author.bot) return
        if (!message.guild) return

        await DB.deleteOne({
            GuildID: message.guild.id,
            UserID: message.author.id
        })
            .exec()
            .catch(() => {})

        if (!DB) return

        if (message.mentions.members?.size) {
            const Embed = new EmbedBuilder().setColor('Red')
            message.mentions.members.forEach((m) => {
                DB.findOne({ GuildID: message.guild?.id, UserID: m.id })
                    .exec()
                    .then(async (data) => {
                        if (data) {
                            return await message.reply({
                                embeds: [
                                    Embed.setDescription(
                                        `<:idle:1265560546212577352> | ${m} 已進入AFK模式\nAfk時間: <t:${data.Time}:R>\n **狀態**: ${data.Status}`
                                    )
                                ]
                            })
                        }
                    })
            })
        }
    }
}
