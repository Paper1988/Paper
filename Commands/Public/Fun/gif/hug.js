const { EmbedBuilder, ChatInputCommandInteraction, SlashCommandBuilder } = require('discord.js')
const rga = require('random-gif-api')

module.exports = {
    subCommand: 'gif.hug',
    usage: '/hug <member>',
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const Target = interaction.options.getUser('member')
        const Executer = interaction.user
        const data = await rga.getGif('cuddle')
        const HugEmbed = new EmbedBuilder()
            .setColor('#000000')
            .setDescription(`**${Executer} 給了 ${Target} 一個大大的擁抱**`)
            .setImage(data)
            .setTimestamp()

        if (Target.id === Executer.id) {
            Response = new EmbedBuilder()
                .setColor('#000000')
                .setDescription(
                    '<:outage_868122243845206087:1202112862990897172> | 你不能擁抱自己！'
                )
            return interaction.reply({ embeds: [Response] })
        } else {
            interaction.reply({ embeds: [HugEmbed] })
        }
    }
}
