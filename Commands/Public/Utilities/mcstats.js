const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    MessageFlags
} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mcstats')
        .setDescription('顯示一個Minecraft伺服器的資訊')
        .addStringOption((option) =>
            option.setName('server-ip').setDescription('伺服器的IP').setRequired(true)
        ),
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const ip = interaction.options.getString('server-ip')

        let msg
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
                    await interaction.editReply({
                        embeds: [embed],
                        components: [button]
                    })
                    await updated.followUp({
                        content: '<:correct:1265560254708711467> | 已刷新數據!',
                        flags: MessageFlags.Ephemeral
                    })
                } else {
                    msg = await interaction.reply({
                        embeds: [embed],
                        components: [button],
                        flags: MessageFlags.Ephemeral
                    })
                }
            } else {
                await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral })
            }
        }

        let getData = await fetch(`https://mcapi.us/server/status?ip=${ip}`)
        let response = await getData.json()

        if (response.status == 'error') {
            await sendMessage(`<:warning:1265562532857380936> | \`${ip}\` 處於離線狀態或不存在!`)
        } else if (response.status == 'success') {
            await sendMessage(
                `<:globe:1265560486208864318> | **Minecraft 伺服器**:\n\n在線: ${response.online}\n名稱: ${response.server.name}\nIP: ${ip.toLowerCase()}\n最大玩家上限: ${response.players.max}\n在線玩家: ${response.players.now}`,
                true
            )
            const collector = msg.createMessageComponentCollector()
            collector.on('collect', async (interaction) => {
                if (interaction.customId == 'mcstats:refresh') {
                    let updatedData = await fetch(`https://mcapi.us/server/status?ip=${ip}`)
                    let response = await updatedData.json()
                    await sendMessage(
                        `<:globe:1265560486208864318> | **Minecraft 伺服器**:\n\n在線: ${response.online}\n名稱: ${response.server.name}\nIP: ${ip.toLowerCase()}\n最大玩家上限: ${response.players.max}\n在線玩家: ${response.players.now}`,
                        true,
                        interaction
                    )
                } else return
            })
        }
    }
}
