const { EmbedBuilder, ChatInputCommandInteraction } = require('discord.js')
const { ApexImagine } = require('apexify.js')

module.exports = {
    subCommand: 'ai-service.prodia',
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        await interaction.deferReply({ fetchReply: true })

        const prompt = interaction.options.getString('prompt')
        const negative_prompt = interaction.options.getString('negative_prompt') || ''
        const number = interaction.options.getInteger('number') || 2
        // const style = interaction.options.getString('style')

        const embed = new EmbedBuilder()
            .setColor('Aqua')
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() })
            .setFooter({ text: '由 Prodia 驅動' })

        await ApexImagine('prodia', prompt, {
            count: number,
            negative_prompt
            //image_style: style
        })
            .then(async (response) => {
                await interaction.editReply({
                    embeds: [embed.setDescription(`以下為根據提示\`${prompt}\`生成的圖片`)]
                })

                for (let i in response) {
                    await interaction.channel.send(response[i])
                }
            })
            .catch((err) => {
                interaction.editReply({
                    embeds: [
                        embed
                            .setDescription('<:outage:1265561329528471613> | ' + err)
                            .setColor('Red')
                    ]
                })
                console.log(err)
            })
    }
}
