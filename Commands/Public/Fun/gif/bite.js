const { EmbedBuilder, ChatInputCommandInteraction, SlashCommandBuilder } = require('discord.js')
const rga = require('random-gif-api')

module.exports = {
    subCommand: 'gif.bite',
    usage: '/bite <member>',
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const Target = interaction.options.getUser('member')
        const Executer = interaction.user
        const data = await rga.getGif('bite')
        const HugEmbed = new EmbedBuilder()
            .setColor('#000000')
            .setDescription(`**${Executer} 咬了一口 ${Target}**`)
            .setImage(data)
            .setTimestamp()

        if (Target.id === Executer.id) {
            Response = new EmbedBuilder()
                .setColor('#000000')
                .setDescription(
                    '<:outage_868122243845206087:1202112862990897172> | 你不能咬你自己！'
                )
            return interaction.reply({ embeds: [Response] })
        } else {
            interaction.reply({ embeds: [HugEmbed] })
        }
    }
}
