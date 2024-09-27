const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } = require('discord.js')
const { ApexChat } = require('apexify.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chat-gpt')
        .setDescription('使用ChatGPT')
        .addStringOption((options) =>
            options.setName('prompt').setDescription('請提供訊息').setRequired(true)
        ),
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true })

        const prompt = interaction.options.getString('prompt')
        const serverName = interaction.guild.name
        const channelName = interaction.channel.name
        const username = interaction.user.username

        const embed = new EmbedBuilder().setColor('Aqua')

        await ApexChat('gpt-4', prompt, {
            userId: interaction.user.id,
            memory: true,
            instruction: `你是一個在 ${serverName}-${channelName} 中協助服務的AI機器人(使用繁體中文回答)，負責回應用戶名稱為${username}的提示。`,
            limit: 12
        })
            .then(
                async (response) =>
                    await interaction.editReply({ embeds: [embed.setDescription(response)] })
            )
            .catch((err) =>
                interaction.editReply({
                    embeds: [embed.setDescription('<:outage:1265561329528471613> | ' + err)]
                })
            )
    }
}
