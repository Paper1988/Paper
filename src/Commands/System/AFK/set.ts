import DB from '@/Structures/Schemas/AFKSystem.js'
import type { SubCommandType } from '@/typings/command.js'
import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from 'discord.js'

export default {
    subCommand: 'afk.set',
    async execute(interaction: ChatInputCommandInteraction) {
        const guild = interaction.guild!
        const user = interaction.user!
        const { options, createdTimestamp } = interaction

        const Embed = new EmbedBuilder().setAuthor({
            name: user.tag,
            iconURL: user.displayAvatarURL()
        })

        const afkStatus = options.getString('status')

        await DB.findOneAndUpdate(
            { GuildID: guild.id, UserID: user.id },
            { Status: afkStatus, Time: createdTimestamp / 1000 },
            { returnDocument: 'after', upsert: true }
        )

        Embed.setColor('Green').setDescription(
            `<:correct:1265560254708711467> | 你的afk狀態已被設置為: \`${afkStatus}\``
        )
        return interaction.reply({ embeds: [Embed], flags: MessageFlags.Ephemeral })
    }
} as SubCommandType
