import type { SubCommandType } from '@/typings/command.js'
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js'
import rga from 'random-gif-api'

export default {
    subCommand: 'gif.kiss',
    async execute(interaction: ChatInputCommandInteraction) {
        const Target = interaction.options.getUser('member')!
        const Executer = interaction.user
        const data = await rga.getGif('kiss')
        const kissEmbed = new EmbedBuilder()
            .setColor('#000000')
            .setDescription(`**${Executer} 親了一下 ${Target}**`)
            .setImage(data)
            .setTimestamp()

        if (Target.id === Executer.id) {
            const Response = new EmbedBuilder()
                .setColor('#000000')
                .setDescription('<:outage:1265561329528471613> | 你不能親吻你自己！')
            return await interaction.reply({ embeds: [Response] })
        } else {
            await interaction.reply({ embeds: [kissEmbed] })
        }
    }
} as SubCommandType
