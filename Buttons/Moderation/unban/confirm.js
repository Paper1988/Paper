const { EmbedBuilder, ButtonInteraction, Client } = require('discord.js')
const { msg } = require('../../../Commands/Moderation/unban')
const { member } = require('../../../Menus/unban')

module.exports = {
    id: 'unban:confirm',
    /**
     *
     * @param {ButtonInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const { guild } = interaction
        const processEmbed = new EmbedBuilder()
            .setColor('Blue')
            .setDescription(`<a:discord1792loading:1212016238839070791> | 正在執行中...`)
            .setFooter({
                text: client.user.username,
                iconURL: client.user.displayAvatarURL()
            })

        await interaction.update({
            embeds: [processEmbed],
            components: []
        })

        await guild.members.unban(member.id, `由 ${interaction.user.username} 操作`)

        const finishedEmbed = new EmbedBuilder()
            .setColor('Blue')
            .setDescription(`${member} 已被解除封鎖!`)
            .setFooter({
                text: '你可以關閉這個視窗了'
            })

        await msg.edit({
            embeds: [finishedEmbed],
            components: []
        })
    }
}
