const { ChatInputCommandInteraction } = require("discord.js");
const DB = require("../../../Structures/Schemas/AntiAlt");

module.exports = {
    subCommand: 'anti-alt.reset',
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const options = interaction.options;
        const { guild } = interaction;

        const LogsReset = new EmbedBuilder()
            .setDescription(
                "✅ | 成功重置日誌頻道"
            )
            .setColor("#43b581");
        DB.deleteMany({ GuildID: guild.id }, async(err, data) => {
            if (err) throw err;
            if (!data)
                return interaction.reply({
                    content: "沒有要刪除的數據",
                });
            interaction.reply({ embeds: [LogsReset] });
        });
    }
}