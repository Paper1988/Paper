const { SlashCommandBuilder, ChatInputCommandInteraction } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("讓機器人代替你說話")
    .addStringOption((option) => option.setName("text").setDescription("請輸入文字").setRequired(true)),
    /**
     * @param {ChatInputCommandInteraction} interaction 
     */
    execute(interaction) {
        interaction.reply(interaction.options.getString("text"));
    }
}