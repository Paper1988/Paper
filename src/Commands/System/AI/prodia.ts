import type { SubCommandType } from '@/typings/command.js'
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js'
/* const { ApexImagine } = require('apexify.js') */

export default {
    subCommand: 'ai.prodia',
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral })

        const prompt = interaction.options.getString('prompt')
        const negative_prompt = interaction.options.getString('negative_prompt') || ''
        const number = interaction.options.getInteger('number') || 2

        return interaction.editReply({
            content: '這個指令正在修復中，無法使用。'
        })

        /* const embed = new EmbedBuilder()
            .setColor('Aqua')
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.avatarURL()
            })
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
            }) */
    }
} as SubCommandType
