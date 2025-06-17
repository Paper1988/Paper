import type { SubCommandType } from '@/typings/command.js'
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js'
import rga from 'random-gif-api'

export default {
    subCommand: 'gif.dance',
    async execute(interaction: ChatInputCommandInteraction) {
        const Executer = interaction.user!
        const data = await rga.getGif('dance')
        const HugEmbed = new EmbedBuilder()
            .setColor('#000000')
            .setDescription(`**${Executer} 跳了一支舞 **`)
            .setImage(data)
            .setTimestamp()

        await interaction.reply({ embeds: [HugEmbed] })
    }
} as SubCommandType
