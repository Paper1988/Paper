const { EmbedBuilder, ChatInputCommandInteraction, SlashCommandBuilder } = require("discord.js");
const DB = require("../../../../Structures/Schemas/AFKSystem");

module.exports = {
    subCommand: "afk.return",
    /**
     * 
     * @param {Client} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(client, interaction) {
        const { guild, options, user, createdTimestamp } = interaction;

        const Embed = new EmbedBuilder()
            .setAuthor(user.tag, user.displayAvatarURL({ dynamic: true }));

        const afkStatus = options.getString("status");

        await DB.deleteOne({ GuildID: guild.id, UserID: user.id });

        Embed.setColor("Red").setDescription(`你的afk狀態已被移除`);
        return interaction.reply({ embeds: [Embed], ephemeral: true });
    }

}