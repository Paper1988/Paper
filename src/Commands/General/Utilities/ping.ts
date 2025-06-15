import { ChatInputCommandInteraction, Client, MessageFlags, SlashCommandBuilder } from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setNameLocalization('zh-TW', 'ping')
        .setNameLocalization('ja', 'ピング')
        .setDescription('Pong!')
        .setDescriptionLocalization('zh-TW', 'pong!')
        .setDescriptionLocalization('ja', 'pong!'),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const msg = await interaction.reply({
            content: '正在計算延遲....',
            flags: MessageFlags.Ephemeral
        })
        const ping = msg.createdTimestamp - interaction.createdTimestamp
        await interaction.editReply({
            content: `🏓Pong!\nAPI延遲: \`${client.ws.ping}ms\`\n機器人延遲: \`${ping}ms\``
        })
    }
}
