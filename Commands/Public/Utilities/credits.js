const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("credits")
    .setDescription("檢視版權資訊"),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const embed = new EmbedBuilder()
        .setTitle("版權提供者")
        .addFields({
            name: "Icons圖標",
            value: "<:iconsgit_1032468076110811236:1202552616316567593> https://discord.gg/9AtkECMX2P"
        })
        interaction.reply({ embeds: [embed], ephemeral: true });
    }
}