const {
  EmbedBuilder,
  ChatInputCommandInteraction,
  Client,
  ChannelType,
  UserFlags,
  version,
  SlashCommandBuilder,
} = require("discord.js");

const { connection } = require("mongoose");
const os = require("os");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("顯示Paper的資訊及資料庫狀態"),
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const formatter = new Intl.ListFormat("en-GB", {
      style: "long",
      type: "conjunction",
    });

    const status = ["<:icons_badping:880113405007114271>離線", "<:icons_goodping:880113406915538995>連線", "<:icons_idelping:880113405720145990>連線中...", "<:icons_idelping:880113405720145990>離線中..."];

    await client.user.fetch();
    await client.application.fetch();

    const getChannelTypeSize = (type) =>
      client.channels.cache.filter((channel) => type.includes(channel.type)).size;

    const embed = new EmbedBuilder()
        .setColor(interaction.guild.members.me.roles.highest.hexColor)
        .setTitle(`${client.user.username} 的機器人資訊`)
        .setThumbnail(client.user.displayAvatarURL({ size: 1024 }))
        .addFields(
          {
            name: "<:icons_quotes:860123643887091723>機器人描述",
            value: `\n${client.application.description || "<:icons_xmarkwhite:988409378161954866>"}`,
          },
          {
            name: "<:icons_generalinfo:866599434098835486> 一般",
            value: [
              `<:icons_Person:859388129932214292> **用戶端** \`${client.user.tag}\``,
              `<:icons_id:860133546102620190> **ID** \`${client.user.id}\``,
              `<:icons_clock:964491800465276940> **創建時間** <t:${parseInt(
                client.user.createdTimestamp / 1000
              )}:R>`,
              `<:icons_owner:859429432380227594> **擁有者** ${
                client.application.owner
                  ? `<@${client.application.owner.id}> (${client.application.owner.tag})`
                  : "<:icons_xmarkwhite:988409378161954866>"
              }`,
              `<:icons_serververified:861920754755960832> **驗證** \`${
                client.user.flags & UserFlags.VerifiedBot ? "<:icons_verified:859424400939286549>" : "<:icons_xmarkwhite:988409378161954866>"
              }\``,
              `<:icons_store:875395222673186817> **標籤** \`${
                client.application.tags.length
                  ? formatter.format(
                      client.application.tags.map((tag) => `*${tag}*`)
                    )
                  : "<:icons_xmarkwhite:988409378161954866>"
              }\``,
              `<:icons_supportscommandsbadge:1000051291839545454> **指令數** \`${client.commands.size}\``,
            ].join("\n"),
          },
          {
            name: "<:icons_monitor:866583417138839563>系統",
            value: [
              `<:icons_settings:859388128040976384> **作業系統** \`${os
                .type()
                .replace("Windows_NT", "Windows")
                .replace("Darwin", "macOS")}\``,
              `<:icons_reminder:859388128364199946> **上線時間** <t:${parseInt(
                client.readyTimestamp / 1000
              )}:R>`,
              `<:icons_connect:875395223512047626> **Ping** \`${client.ws.ping}ms\``,
              `<:icons_dollar:988409333782020216> **CPU型號** \`${os.cpus()[0].model}\``,
              `<:icons_bulb:882595243579559958> **CPU使用率** \`${(
                process.memoryUsage().heapUsed /
                1024 /
                1024
              ).toFixed(2)}%\``,
              `<:icons_library:867022827035164692> **資料庫** \`${status[connection.readyState]}\``,
              `<:icons_nodejs:891686636625223680> **Node.js** \`${process.version}\``,
              `<:icons_discordjs:891686633991192607> **Discord.js** \`${version}\``,
            ].join("\n"),
            inline: true,
          },
          {
            // Using the caches for some of these isn't always reliable, but it would be a waste of resources to loop through all servers every single time someone used this command.
            name: "<:icons_list:860123643710537789>各項統計",
            value: [
              `<:icons_globe:859424401971609600> **伺服器** \`${client.guilds.cache.size}\``,
              `<:icons_people:964425853930995783> **使用者** \`${client.users.cache.size}\``,
              `<:icons_addreactions:866920224581746698> **表情符號** \`${client.emojis.cache.size}\``,
              `<:icons_channel:859424401950113822> **文字頻道** \`${getChannelTypeSize([
                ChannelType.GuildText,
                ChannelType.GuildForum,
              ])}\``,
              `<:icons_speaker:860133545544908802> **語音頻道** \`${getChannelTypeSize([
                ChannelType.GuildVoice,
                ChannelType.GuildStageVoice,
              ])}\``,
              `<:icons_forum:964425853138264094> **討論串** \`${getChannelTypeSize([
                11,
                12,
                10,
              ])}\``,
            ].join("\n"),
            inline: true,
          }
      );
    interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
