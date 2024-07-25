const { EmbedBuilder, ChatInputCommandInteraction } = require('discord.js')
const rga = require('random-gif-api')

module.exports = {
    subCommand: 'gif.dance',
    usage: '/dance',
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const Executer = interaction.user
        const data = await rga.getGif('dance')
        const HugEmbed = new EmbedBuilder()
            .setColor('#000000')
            .setDescription(`**${Executer} 跳了一支舞 **`)
            .setImage(data)
            .setTimestamp()

        await interaction.reply({ embeds: [HugEmbed] })
    }
}
