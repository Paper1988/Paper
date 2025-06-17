import type { SubCommandType } from '@/typings/command.js'
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js'
import rga from 'random-gif-api'

export default {
    subCommand: 'gif.hug',
    async execute(interaction: ChatInputCommandInteraction) {
        const Target = interaction.options.getUser('member')!
        const Executer = interaction.user
        const data = await rga.getGif('cuddle')
        const HugEmbed = new EmbedBuilder()
            .setColor('#000000')
            .setDescription(`**${Executer} 給了 ${Target} 一個大大的擁抱**`)
            .setImage(data)
            .setTimestamp()

        if (Target.id === Executer.id) {
            const Response = new EmbedBuilder()
                .setColor('#000000')
                .setDescription('<:outage:1265561329528471613> | 你不能擁抱自己！')
            return await interaction.reply({ embeds: [Response] })
        } else {
            await interaction.reply({ embeds: [HugEmbed] })
        }
    }
} as SubCommandType
