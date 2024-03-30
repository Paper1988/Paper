const {
    ButtonInteraction,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require('discord.js')

module.exports = {
    id: 'mcstats:refresh',
    /**
     *
     * @param {ButtonInteraction} interaction
     */
    async execute(interaction) {
        if (!interaction.isButton()) return

        var msg
        async function sendMessage(message, button, updated) {
            const embed = new EmbedBuilder().setColor('Blurple').setDescription(message)

            if (button) {
                const button = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('mcstats:refresh')
                        .setLabel('🔄 刷新數據')
                        .setStyle(ButtonStyle.Primary)
                )

                if (updated) {
                    await interaction.editReply({ embeds: [embed], components: [button] })
                    await updated.followUp({
                        content: '<:correct_859388130411282442:1201843648229294121>已刷新數據!',
                        ephemeral: true
                    })
                } else {
                    msg = await interaction.reply({
                        embeds: [embed],
                        components: [button],
                        ephemeral: true
                    })
                }
            } else {
                await interaction.reply({ embeds: [embed], ephemeral: true })
            }
        }

        let getData = await fetch(`https://mcapi.us/server/status?ip=${ip}`)
        let response = await getData.json()

        if (response.status == 'error') {
            await sendMessage(
                `<:warning_908958943466893323:1201844340276862976> | \`${ip}\` 不是\`離線狀態\`就是\`不存在\``
            )
        } else if (response.status == 'success') {
            let updatedData = await fetch(`https://mcapi.us/server/status?ip=${ip}`)
            let response = await updatedData.json()
            await sendMessage(
                `<:globe_859424401971609600:1201843661785284659> | **Minecraft 伺服器**:\n\n在線: ${response.online}\n名稱: ${response.server.name}\nIP: ${ip.toLowerCase()}\n最大玩家上限: ${response.players.max}\n在線玩家: ${response.players.now}`,
                true,
                interaction
            )
        }
    }
}
