const { ChatInputCommandInteraction, EmbedBuilder } = require('discord.js')
const rga = require('random-gif-api')

module.exports = {
    subCommand: 'gif.pat',
    usage: '/pat <member>',
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const Target = interaction.options.getMember('member')
        const Executer = interaction.user
        const data = await rga.getGif('pat')
        const patEmbed = new EmbedBuilder()
            .setColor('#000000')
            .setDescription(`**${Executer} 摸了一下 ${Target}**`)
            .setImage(data)
            .setTimestamp()

        if (Target.id === Executer.id) {
            Response = new EmbedBuilder()
                .setColor('#000000')
                .setDescription(
                    '<:outage_868122243845206087:1202112862990897172> | 你不能摸你自己!'
                )
            return await interaction.reply({ embeds: [Response] })
        } else {
            await interaction.reply({ embeds: [patEmbed] })
        }
    }
}
