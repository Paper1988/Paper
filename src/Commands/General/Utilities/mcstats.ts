import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    MessageFlags,
    SlashCommandBuilder
} from 'discord.js'

interface MinecraftServerResponse {
    status: 'success' | 'error'
    online: boolean
    server: {
        name: string
    }
    players: {
        max: number
        now: number
    }
}

export default {
    data: new SlashCommandBuilder()
        .setName('mcstats')
        .setNameLocalization('zh-TW', '伺服器資訊')
        .setNameLocalization('ja', 'マインクラフトサーバー情報')
        .setDescription('display a Minecraft server information')
        .setDescriptionLocalization('zh-TW', '顯示Minecraft伺服器的資訊')
        .setDescriptionLocalization('ja', 'Minecraftサーバーの情報を表示')
        .addStringOption((option) =>
            option
                .setName('server-ip')
                .setNameLocalization('zh-TW', '伺服器ip')
                .setNameLocalization('ja', 'サーバーip')
                .setDescription('Ip address of the server')
                .setDescriptionLocalization('zh-TW', '伺服器的ip')
                .setDescriptionLocalization('ja', 'サーバーのip')
                .setRequired(true)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const ip = interaction.options.getString('server-ip')

        let msg: any
        async function sendMessage(
            message: string,
            button?: ActionRowBuilder | boolean,
            updated?: ChatInputCommandInteraction | ButtonInteraction | boolean
        ) {
            const embed = new EmbedBuilder().setColor('Blurple').setDescription(message)

            if (button) {
                const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId('mcstats:refresh')
                        .setLabel('🔄 刷新數據')
                        .setStyle(ButtonStyle.Primary)
                )

                if (updated) {
                    await interaction.editReply({
                        embeds: [embed],
                        components: [buttonRow]
                    })
                    await (updated as ChatInputCommandInteraction).followUp({
                        content: '<:correct:1265560254708711467> | 已刷新數據!',
                        flags: MessageFlags.Ephemeral
                    })
                } else {
                    msg = await interaction.reply({
                        embeds: [embed],
                        components: [buttonRow],
                        flags: MessageFlags.Ephemeral
                    })
                }
            } else {
                await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral })
            }
        }

        const getData = await fetch(`https://mcapi.us/server/status?ip=${ip}`)
        const response = (await getData.json()) as MinecraftServerResponse

        if (response.status == 'error') {
            await sendMessage(`<:warning:1265562532857380936> | \`${ip}\` 處於離線狀態或不存在!`)
        } else if (response.status == 'success') {
            await sendMessage(
                `<:globe:1265560486208864318> | **Minecraft 伺服器**:\n\n在線: ${response.online}\n名稱: ${response.server.name}\nIP: ${ip!.toLowerCase()}\n最大玩家上限: ${response.players.max}\n在線玩家: ${response.players.now}`,
                true
            )
            const collector = msg.createMessageComponentCollector()
            collector.on('collect', async (buttonInteraction: ButtonInteraction) => {
                if (buttonInteraction.customId == 'mcstats:refresh') {
                    const updatedData = await fetch(`https://mcapi.us/server/status?ip=${ip}`)
                    const updatedResponse = (await updatedData.json()) as MinecraftServerResponse
                    await sendMessage(
                        `<:globe:1265560486208864318> | **Minecraft 伺服器**:\n\n在線: ${updatedResponse.online}\n名稱: ${updatedResponse.server.name}\nIP: ${ip!.toLowerCase()}\n最大玩家上限: ${updatedResponse.players.max}\n在線玩家: ${updatedResponse.players.now}`,
                        true,
                        buttonInteraction
                    )
                } else {
                    return
                }
            })
        }
    }
}
