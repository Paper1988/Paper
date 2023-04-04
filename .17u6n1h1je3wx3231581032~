const { ChatInputCommandInteraction, Client } = require("discord.js");
const DB = require("../../../Structures/Schemas/AntiAlt");

module.exports = {
    subCommand: 'anti-alt.setup',
    /**
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction, client) {
        const options = interaction.options;
        const { guild } = interaction;

        const LogsChannel = options.getChannel("channel");

        await DB.findOneAndUpdate({ GuildID: guild.id }, {
            LogsChannel: LogsChannel.id,
        }, {
            new: true,
            upsert: true,
        }).catch((err) => console.log(err));

        const LogsSetup = new EmbedBuilder()
            .setDescription(
                "✅ | 成功設置反alt伺服器日誌"
            )
            .setColor("#43b581");

        await guild.channels.cache
            .get(LogsChannel.id)
            .send({ embeds: [LogsSetup] })
            .then((m) => {
                setTimeout(() => {
                    m.delete().catch(() => {});
                }, 1 * 7500);
            });

        await interaction.reply({
            content: "完成",
            ephemeral: true,
        });
    }
}