const { ChatInputCommandInteraction, SlashCommandBuilder, Client } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder().setName('ping').setDescription('Pong!').setDMPermission(false),
    usage: '/ping',
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const msg = await interaction.reply({
            content: '正在計算延遲....', //設定訊息的內容
            ephemeral: true,
            fetchReply: true //告訴API我們將會對這個指令做出進一步的回應
        })
        const ping = msg.createdTimestamp - interaction.createdTimestamp
        await interaction.editReply({
            content: `🏓Pong!\nAPI延遲: \`${client.ws.ping}ms\`\n機器人延遲: \`${ping}ms\``,
            ephemeral: true
        })
    }
}
