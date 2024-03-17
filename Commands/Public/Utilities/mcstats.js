const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder
} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mcstats')
        .setDescription('顯示一個Minecraft伺服器的資訊')
        .addStringOption((option) =>
            option.setName('server-ip').setDescription('伺服器的IP').setRequired(true)
        )
        .setDMPermission(false),
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const { options } = interaction
        const ip = options.getString('server-ip')

        var msg
        async function sendMessage(message, button, updated) {
            const embed = new EmbedBuilder().setColor('Blurple').setDescription(message)

            if (button) {
                const button = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('mcstats_refresh')
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

        var getData = await fetch(`https://mcapi.us/server/status?ip=${ip}`)
        var response = await getData.json()

        if (response.status == 'error') {
            await sendMessage(
                `<:warning_908958943466893323:1201844340276862976> | \`${ip}\` 不是\`離線狀態\`就是\`不存在\``
            )
        }

        if (response.status == 'success') {
            await sendMessage(
                `<:globe_859424401971609600:1201843661785284659> | **Minecraft 伺服器**:\n\n在線: ${response.online}\n名稱: ${response.server.name}\nIP: ${ip.toLowerCase()}\n最大玩家上限: ${response.players.max}\n在線玩家: ${response.players.now}`,
                true
            )
        }
    }
}
