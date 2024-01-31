const {
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  name: "guildDelete",
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const guild = interaction;

    const Embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("Paper退出了一個伺服器")
      .setDescription(`<:leave_860487640113217546:1202217506991771658>${client.user.tag} 退出了一個伺服器`)
      .setFields(
        { name: "伺服器名稱:", value: `${guild.name}`, inline: true },
        { name: "成員數量:", value: `${guild.memberCount}`, inline: true },
        { name: "伺服器總數", value: `${client.guilds.cache.size}` },
        { name: "成員總數", value: `${client.users.cache.size}` }
      )
      .setTimestamp();

    const logC = client.channels.cache.get("961615076740194326");

    logC.send({ embeds: [Embed] });
  },
};
