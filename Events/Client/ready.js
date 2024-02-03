const { Client, EmbedBuilder, ActivityType } = require("discord.js");
const mongoose = require("mongoose");

const { loadCommands } = require("../../Structures/Handlers/commandHandler.js");

module.exports = {
  name: "ready",
  once: true,
  /**
   * @param {Client} client
   */
  async execute(client) {
    const activities = [
      `${client.guilds.cache.size} 個伺服器`
      `${client.users.cache.size} 位用戶`
    ];

    setInterval(() => {
      const status = activities[Math.floor(Math.random() * activities.length)];
      client.user.setActivity(status, {
        type: ActivityType.Watching,
      });
    });
    // client.user.setActivity(`Updating 更新中....`);
    client.user.setStatus(`online`);
    console.log(`${client.user.username} 已上線!`);
    loadCommands(client);

    console.log(`${client.user.username} 準備好ㄌ!`);
    const channel = client.channels.cache.get("961615076220092496");
    const Embed = new EmbedBuilder()
      .setColor("Green")
      .setDescription(`<:online_860123643395571713:1202213698467274792> ${client.user} 上線了!`)
      .setFooter({ text: client.user.tag })
      .setTimestamp();

    channel.send({ embeds: [Embed] });

    mongoose.set('strictQuery', false);
    mongoose.connect(client.config.Database, {}).then(() =>
      console.log(`>>> ✅ 成功連結到 MongoDB!`)
    );
  },
};