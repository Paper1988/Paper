const { EmbedBuilder, ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const DB = require("../../Structures/Schemas/LockDown");
const ms = require("ms");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lockdown")
        .setDescription("鎖定住這個頻道")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addStringOption((option) => option.setName("time").setDescription("此鎖定的到期日期").setRequired(true))
        .addStringOption((option) => option.setName("reason").setDescription("請提供鎖定這個頻道的理由").setRequired(false)),
    usage: "/lockdown (time, reason)",
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const { guild, channel, options } = interaction;

        const Reason = options.getString("reason") || "未提供原因";

        const Embed = new EmbedBuilder();

        if (!channel.permissionsFor(guild.id).has("SEND_MESSAGES"))
            return interaction.reply({ embeds: [Embed.setColor("Red").setDescription("⛔ | 這個頻道已經被鎖定了")], ephemeral: true });

        channel.permissionOverwrites.edit(guild.id, {
            SEND_MESSAGES: false
        });

        interaction.reply({ embeds: [Embed.setColor("Red").setDescription(`🔒 | 這個頻道現在因為 **${Reason}** 而被鎖定`)] })
        const Time = options.getString("time");
        if (Time) {
            const ExpireDate = Date.now() + ms(Time);
            DB.create({ GuildID: guild.id, ChannelID: channel.id, Time: ExpireDate });

            setTimeout(async() => {
                channel.permissionOverwrites.edit(guild.id, {
                    SEND_MESSAGES: null
                });
                interaction.editReply({ embeds: [Embed.setDescription("🔓 | 鎖定已被解除").setColor("Green")] }).catch(() => {});

                await DB.deleteOne({ ChannelID: channel.id });
            }, ms(Time));
        }
    }
}