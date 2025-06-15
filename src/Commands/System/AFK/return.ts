import type { SubCommandType } from '@/typings/command'
import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from 'discord.js'
import DB from '../../../Structures/Schemas/AFKSystem'

export default {
    subCommand: 'afk.return',
    async execute(interaction: ChatInputCommandInteraction) {
        const guild = interaction.guild!
        const user = interaction.user!

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
} as SubCommandType
