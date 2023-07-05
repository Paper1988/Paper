const { EmbedBuilder, ChatInputCommandInteraction, SlashCommandBuilder } = require("discord.js");
const DB = require("../../../../Structures/Schemas/AFKSystem");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("afk")
        .setDescription("一個afk系統")
        .addSubcommand((sub) =>
            sub
            .setName("set")
            .setDescription("設定你的afk狀態")
            .addStringOption((options) =>
							options
							.setName("status")
							.setDescription("設定你的狀態")
							.setRequired(true)
						)
        )
        .addSubcommand((sub) =>
            sub
            .setName("return")
            .setDescription("退出afk狀態")
        ),
    usage: "/afk (set, return)",
}