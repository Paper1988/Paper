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
        .setName("kick")
        .setDescription("將成員踢出伺服器")
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setDMPermission(false)
        .addUserOption((options) =>
            options
            .setName("target")
            .setDescription("選擇一名目標成員")
            .setRequired(true)
        )
        .addStringOption((options) =>
            options
            .setName("reason")
            .setDescription("請提供原因")
            .setMaxLength(512)
        ),
    /**
     *
     * @param {ChatInputCommandInteraction} interactions
     */
    async execute(interaction, client) {
        const { options, guild, member } = interaction;

        const target = options.getMember("target");
        const reason = options.getString("reason") || "無指定";

        const errorsArray = [];

        const dmEmbed = new EmbedBuilder()
            .setAuthor({
                name: `Kick`,
                iconURL: guild.iconURL(),
            })
            .setColor(client.color)
            .setDescription(
                [
                    `你已經被 **踢出** - 在 ${interaction.guild.name}`,
                    `執行者: ${member}`,
                    `\n原因: ${reason}`,
                ].join("\n")
            )
            .setFooter({
                iconURL: guild.iconURL(),
                text: `機器人 | ${interaction.user.username}`,
            });

        const errorsEmbed = new EmbedBuilder()
            .setAuthor({
                name: "無法踢出成員，因為",
            })
            .setColor("Red");

        if (!target)
            return interaction.reply({
                embeds: [
                    errorsEmbed.setDescription("所選成員很可能已經離開伺服器了"),
                ],
                ephermeral: true,
            });

        if (member.roles.highest.postion < target.roles.highest.postion)
            errorsArray.push("所選成員的權限比你高!");

        if (errorsArray.length)
            return interaction.reply({
                embeds: [errorsEmbed.setDescription(errorsArray.join("\n"))],
                ephermeral: true,
            });

        target.send({ embeds: [dmEmbed] });
        target.kick({ reason: reason }).catch((err) => {
            interaction.reply({
                embeds: [
                    errorsEmbed.setDescription(
                        "無法踢出成員由於一個不常見的錯誤"
                    ),
                ],
            });
            return console.log("錯誤發生 - 在Kick.js", err);
        });

        const newInfractionsObject = {
            Type: "Kick",
            IssuerID: member.id,
            IssuerTag: member.user.tag,
            Reason: reason,
            Date: Date.now(),
        };

        let userData = await DataBase.findOne({ Guild: guild.id, User: target.id });
        if (!userData)
            userData = await DataBase.create({
                Guild: guild.id,
                User: target.id,
                Infractions: [newInfractionsObject],
            });
        else
            userData.Infractions.push(newInfractionsObject) &&
            (await userData.save());

        const successEmbed = new EmbedBuilder()
            .setAuthor({
                name: `Kick`,
                iconURL: guild.iconURL(),
            })
            .setColor(client.color)
            .setDescription(
                [
                    `被踢出成員: ${target}`,
                    `執行者: ${member}`,
                    `總違規點數: **${userData.Infractions.length}**`,
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