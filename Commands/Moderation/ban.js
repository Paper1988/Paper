const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChatInputCommandInteraction,
    EmbedBuilder,
} = require("discord.js");
const Database = require("../../Structures/Schemas/Infractions");
const ms = require("ms");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("封鎖一名成員")
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false)
        .addUserOption((options) =>
            options
            .setName("target")
            .setDescription("選擇一個成員")
            .setRequired(true)
        )
        .addStringOption((options) =>
            options
            .setName("reason")
            .setDescription("請提供理由")
            .setMaxLength(512)
            .setRequired(true)
        ),
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction, client) {
        const { options, guild, member } = interaction;

        const target = options.getMember("target");
        const reason = options.getString("reason");

        const errorsArray = [];

        const dmEmbed = new EmbedBuilder()
            .setAuthor({
                name: `Ban`,
                iconURL: guild.iconURL(),
            })
            .setColor("Green")
            .setThumbnail(
                "https://media.discordapp.net/attachments/1059607121194393671/1059923413650640987/295678623038211.png?width=285&height=296"
            )
            .setDescription(
                [
                    `你已從 ${interaction.guild.name} 被 **封鎖**`,
                    `持行者: ${member}`,
                    `總違規點數已被清除`,
                    `\n原因: ${reason}`,
                ].join("\n")
            )
            .setFooter({
                iconURL: guild.iconURL(),
                text: `機器人 | ${interaction.user.username}`,
            });

        const errorsEmbed = new EmbedBuilder()
            .setAuthor({
                name: "無法封鎖該名成員，因為",
            })
            .setColor("Red");

        if (!target)
            return interaction.reply({
                embeds: [
                    errorsEmbed.setDescription("成員很可能已經離開伺服器了"),
                ],
                ephermeral: true,
            });

        if (!target.manageable || !target.moderatable)
            errorsArray.push("所選的目標成員無法由機器人管理( 我的權限不夠大:( ! )");

        if (member.roles.highest.postion < target.roles.highest.postion)
            errorsArray.push("所選的目標成員權限比你高!");

        if (errorsArray.length)
            return interaction.reply({
                embeds: [errorsEmbed.setDescription(errorsArray.join("\n"))],
                ephermeral: true,
            });

        target.send({ embeds: [dmEmbed] });
        target.ban({ reason: reason }).catch((err) => {
            interaction.reply({
                embeds: [
                    errorsEmbed.setDescription(
                        "無法封鎖該名成員，因為一個不常見的錯誤"
                    ),
                ],
            });
            return console.log("錯誤發生 - 在 Ban.js", err);
        });

        let userData = await DataBase.findOneAndDelete({
            Guild: guild.id,
            User: target.id,
        });
        if (!userData)
            interaction.reply({
                embeds: [successEmbed],
            });

        const successEmbed = new EmbedBuilder()
            .setAuthor({
                name: `Ban`,
                iconURL: guild.iconURL(),
            })
            .setColor("Green")
            .setThumbnail(
                "https://media.discordapp.net/attachments/1059607121194393671/1059923413650640987/295678623038211.png?width=285&height=296"
            )
            .setDescription(
                [
                    `封鎖的成員: ${target}`,
                    `執行者: ${member}`,
                    `總違規點數已被清除`,
                    `\n原因: ${reason}`,
                ].join("\n")
            )
            .setFooter({
                iconURL: guild.iconURL(),
                text: `機器人 | ${interaction.user.username}`,
            });
        return interaction.reply({ embeds: [successEmbed] });
    },
};