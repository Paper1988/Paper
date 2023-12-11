const {
  EmbedBuilder,
  ChatInputCommandInteraction,
  Client,
  version,
  SlashCommandBuilder,
} = require("discord.js");
const { connection } = require("mongoose");
const os = require("os");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("顯示Paper的狀態及資料庫狀態"),
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    await client.user.fetch();
    await client.application.fetch();

    const getChannelTypeSize = (type) =>
      client.channels.cache.filter((channel) => type.includes(channel.type))
        .size;

    const status = ["⛔斷線", "✅連線", "🕐連線中...", "🕐斷線中..."];

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setTitle(`${client.user.username} 狀態`)
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setDescription(interaction.client.application.description)
      .addFields(
        { name: "👩🏻‍🔧 用戶端", value: client.user.tag, inline: true },
        {
          name: "📆 創建日期",
          value: `<t:${parseInt(client.user.createdTimestamp / 1000)}:R>`,
          inline: true,
        },
        {
          name: "☑ 驗證",
          value: client.user.flags.has("VerifiedBot") ? "已驗證" : "尚未驗證",
          inline: true,
        },
        {
          name: "👩🏻‍💻 擁有者",
          value: `${interaction.client.application.owner.tag || "無"}`,
          inline: true,
        },
        {
          name: "📚 資料庫狀態",
          value: status[connection.readyState],
          inline: true,
        },
        {
          name: "🖥 系統",
          value: os
            .type()
            .replace("Windows_NT", "Windows")
            .replace("Darwin", "macOS"),
          inline: true,
        },
        {
          name: "🧠 中央處理器(CPU) 型號",
          value: `${os.cpus()[0].model}`,
          inline: true,
        },
        {
          name: "💾 中央處理器(CPU) 使用率",
          value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
            2
          )}%`,
          inline: true,
        },
        {
          name: "⏰ 上線時間",
          value: `<t:${parseInt(client.readyTimestamp / 1000)}:R>`,
          inline: true,
        },
        { name: "👩🏻‍🔧 Node.js", value: process.version, inline: true },
        { name: "🛠 Discord.js", value: version, inline: true },
        { name: "🔧 版本", value: "v1.1.0", inline: true },
        { name: "🏓 延遲", value: `${client.ws.ping}ms`, inline: true },
        { name: "🤹🏻‍♀️ 指令數量", value: `${client.commands.size}`, inline: true },
        {
          name: "🌍 伺服器數量",
          value: `${client.guilds.cache.size}`,
          inline: true,
        },
        {
          name: "👨‍👩‍👧‍👦 使用者數量",
          value: `${client.users.cache.size}`,
          inline: true,
        },
        {
          name: "💬 文字頻道數量",
          value: `${getChannelTypeSize([
            "ChannelType.GuildText",
            "ChannelType.GuildAnnouncement",
          ])}`,
          inline: true,
        },
        {
          name: "🎤 語音頻道數量",
          value: `${getChannelTypeSize([
            "ChannelType.GuildVoice",
            "ChannelType.GuildStageVoice",
          ])}`,
          inline: true,
        },
        {
          name: "🧵 討論串數量",
          value: `${getChannelTypeSize([
            "Guild_Thread",
            "ChannelType.AnnouncementThread",
            "ChannelType.PublicThread",
            "ChannelType.PrivateThread",
          ])}`,
          inline: true,
        },
        {
          name: "💭 論壇頻道數量",
          value: `${getChannelTypeSize(["ChannelType.GuildForum"])}`,
          inline: true,
        }
      );
    interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
