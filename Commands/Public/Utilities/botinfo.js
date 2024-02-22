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
    .setDescription("顯示Paper的資訊及資料庫狀態")
    .setDMPermission(false),
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const formatter = new Intl.ListFormat("en-GB", {
      style: "long",
      type: "conjunction",
    });

    const status = ["<:highping_880113405007114271:1201843664524165120>離線", "<:lowping_880113406915538995:1201843703208222772>連線", "<:midping_880113405720145990:1201843713006120970>連線中...", "<:midping_880113405720145990:1201843713006120970>離線中..."];
    
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
            name: "<:generalinfo_866599434098835486:1201843655393157152> | 一般",
            value: [
              `<:person_859388129932214292:1201843745549455420> **用戶端** \`${client.user.tag}\``,
              `<:id_860133546102620190:1201883864486916166> **ID** \`${client.user.id}\``,
              `<:clock_964491800465276940:1201843646203433030> **創建時間** <t:${parseInt(
                client.user.createdTimestamp / 1000
              )}:R>`,
              `<:owner_859429432380227594:1201843734917152858> **擁有者** ${`<@${client.application.owner.ownerId}> (${client.application.owner.owner.user.tag})`}`,
              `<:verifiedserver_86192075475596083:1201844337542180874> **驗證** ${
                client.user.flags & UserFlags.VerifiedBot ? "<:icons_verified:859424400939286549>" : "<:xmark_988409378161954866:1201844342029815848>"
              }`,
              `<:label_875395222673186817:1201883989212921886> **標籤** \`${
                client.application.tags.length
                  ? formatter.format(
                      client.application.tags.map((tag) => `*${tag}*`)
                    )
                  : "<:xmark_988409378161954866:1201844342029815848>"
              }\``,
              `<:slashcommandsupport_100005129183:1201844295422709790> **指令數** \`${client.commands.size}\``,
            ].join("\n"),
          },
          {
            name: "<:monitor_866583417138839563:1202221790383050845> | 系統",
            value: [
              `<:settings_859388128040976384:1202222047833636865> **作業系統** \`${os
                .type()
                .replace("Windows_NT", "Windows")
                .replace("Darwin", "macOS")}\``,
              `<:reminder_859388128364199946:1201844282307395614> **上線時間** <t:${parseInt(
                client.readyTimestamp / 1000
              )}:R>`,
              `<:internet_875395223512047626:1201843670970798080> **Ping** \`${client.ws.ping}ms\``,
              `<:dollar_988409333782020216:1201843651009843250> **CPU型號** \`${os.cpus()[0].model}\``,
              `<:buld_882595243579559958:1201843638427209738> **RAM使用率** \`${(
                process.memoryUsage().heapUsed /
                1024 /
                1024
              ).toFixed(2)}%\``,
              `<:library_867022827035164692:1202222757203419146> **資料庫連線** ${status[connection.readyState]}`,
              `<:nodejs_891686636625223680:1201843728424378439> **Node.js** \`${process.version}\``,
              `<:djs_891686633991192607:1202223114134769715> **Discord.js** \`${version}\``,
            ].join("\n"),
            inline: true,
          },
          {
            // Using the caches for some of these isn't always reliable, but it would be a waste of resources to loop through all servers every single time someone used this command.
            name: "<:list_860123643710537789:1201843692546039829> | 各項統計",
            value: [
              `<:globe_859424401971609600:1201843661785284659> **伺服器** \`${client.guilds.cache.size}\``,
              `<:people_964425853930995783:1201843743762681906> **使用者** \`${await client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)}\``,
              `<:addreaction_866920224581746698:1201843621398323250> **表情符號** \`${client.emojis.cache.size}\``,
              `<:channel_859424401950113822:1201843641124147280> **文字頻道** \`${getChannelTypeSize([
                ChannelType.GuildText,
                ChannelType.GuildForum,
              ])}\``,
              `<:speaker_860133545544908802:1201844300099354644> **語音頻道** \`${getChannelTypeSize([
                ChannelType.GuildVoice,
                ChannelType.GuildStageVoice,
              ])}\``,
              `<:forum_964425853138264094:1202224009803202660> **討論串** \`${getChannelTypeSize([
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
