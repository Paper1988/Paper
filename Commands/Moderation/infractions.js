const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
		Client,
} = require("discord.js");
const DataBase = require("../../Structures/Schemas/Infractions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("infractions")
        .setDescription("顯示任何成員的違規情況")
        .addUserOption((options) =>
            options
            .setName("target")
            .setDescription("選擇你想要查看的成員")
            .setRequired(true)
        ),
    /**
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction, client) {
        const { options, guild, member } = interaction;

        const target = options.getMember("target");

        const Infractions2 = new EmbedBuilder()
            .setAuthor({
                name: `Infractions`,
                iconURL: guild.iconURL(),
            })
            .setColor("Gold")
            .setDescription(
                [`成員: ${target}`, `總違規點數: **0**`].join("\n")
            )
            .setFooter({
                iconURL: guild.iconURL(),
                text: `機器人 | ${interaction.user.username}`,
            });

        let userData = await DataBase.findOne({
            Guild: guild.id,
            User: target.id,
        });
        if (userData) {
            const Infractions1 = new EmbedBuilder()
                .setAuthor({
                    name: `Infractions`,
                    iconURL: guild.iconURL(),
                })
                .setColor("Gold")
                .setDescription(
                    [
                        `成員: ${target}`,
                        `總違規點數: **${userData.Infractions.length}**`,
                    ].join("\n")
                )
                .setFooter({
                    iconURL: guild.iconURL(),
                    text: `機器人 | ${interaction.user.username}`,
                });

            return interaction.reply({ embeds: [Infractions1] });
        } else interaction.reply({ embeds: [Infractions2] });
    },
};