import type { SubCommandType } from '@/typings/command'
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js'
import rga from 'random-gif-api'

export default {
    subCommand: 'gif.pat',
    async execute(interaction: ChatInputCommandInteraction) {
        const Target = interaction.options.getUser('member')!
        const Executer = interaction.user
        const data = await rga.getGif('pat')
        const patEmbed = new EmbedBuilder()
            .setColor('#000000')
            .setDescription(`**${Executer} 摸了一下 ${Target}**`)
            .setImage(data)
            .setTimestamp()

        if (Target.id === Executer.id) {
            const Response = new EmbedBuilder()
                .setColor('#000000')
                .setDescription('<:outage:1265561329528471613> | 你不能摸你自己!')
            return await interaction.reply({ embeds: [Response] })
        } else {
            await interaction.reply({ embeds: [patEmbed] })
        }
    }
} as SubCommandType
