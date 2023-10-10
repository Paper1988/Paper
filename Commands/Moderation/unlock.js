const { EmbedBuilder, ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } = require("discord.js");
const DB = require("../../Structures/Schemas/LockDown");
const ms = require("ms");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unlock")
        .setDescription("解除鎖定這個頻道")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    usage: "/unlock",
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const { guild, channel } = interaction;

        const Embed = new EmbedBuilder();

        if (channel.permissionsFor(guild.id).has(PermissionFlagsBits.SendMessages))
            return interaction.reply({ embeds: [Embed.setColor("Red").setDescription("⛔ | 這個頻道沒有被鎖定")], ephemeral: true });

        channel.permissionOverwrites.edit(guild.id, {
            id: interaction.guild.id,
    				allow: [PermissionFlagsBits.SendMessages],
        });

        await DB.deleteOne({ ChannelID: channel.id });

        interaction.reply({ embeds: [Embed.setColor("GREEN").setDescription("🔓 | 鎖定已被解除")] })
    }
}