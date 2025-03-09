const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    Client,
    MessageFlags
} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setNameLocalization('zh-TW', 'ping')
        .setNameLocalization('ja', 'ピング')
        .setDescription('Pong!')
        .setDescriptionLocalization('zh-TW', 'pong!')
        .setDescriptionLocalization('ja', 'pong!'),
    usage: '/ping',
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const msg = await interaction.reply({
            content: '正在計算延遲....', //設定訊息的內容
            flags: MessageFlags.Ephemeral
        })
        const ping = msg.createdTimestamp - interaction.createdTimestamp
        await interaction.editReply({
            content: `🏓Pong!\nAPI延遲: \`${client.ws.ping}ms\`\n機器人延遲: \`${ping}ms\``,
            flags: MessageFlags.Ephemeral
        })
    }
}
