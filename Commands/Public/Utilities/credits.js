const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("credits")
    .setDescription("檢視版權資訊")
    .setDMPermission(false),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const embed = new EmbedBuilder()
        .setTitle("版權提供者")
        .addFields({
            name: "Icons圖標",
            value: "https://discord.gg/9AtkECMX2P"
        })
        interaction.reply({ embeds: [embed], ephemeral: true });
    }
}