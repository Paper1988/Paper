const schemas = require("../../../Structures/Schemas/CommandToggle");

const { Client, AutoCompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("Command-Toggle")
    .setDescription("啟用/禁用指令")
    .addStringOption(option =>
        option
            .setName("command")
            .setDescription("請輸入指令名稱")
            .setRequired(true)
    )
    .setDefaultMemberPermission(PermissionFlagsBits.ManageMessages),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        const { options, member } = interaction;
        const command = options.getString("command");
        
        if (!client.commands.has(command)) return interaction.reply({ content: "<:warning_908958943466893323:1201844340276862976> | 我沒有那個指令!", ephemeral: true });

        schemas.findOne({ GuildID: interaction.guild.id, Command: command }, async (err) => {
            if (err) return interaction.reply({ content: "<:warning_908958943466893323:1201844340276862976> | 發生錯誤，請協助回報!", ephemeral: true });
        });


    }
}