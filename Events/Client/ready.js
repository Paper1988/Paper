const { Client, EmbedBuilder, ActivityType } = require("discord.js");
const mongoose = require("mongoose");

const { loadCommands } = require("../../Structures/Handlers/commandHandler.js");
const { loadButtons } = require('../../Structures/buttonHandler.js');

module.exports = {
  name: "ready",
  once: true,
  /**
   * @param {Client} client
   */
  async execute(client) {
    let memberCount = await client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

    const activities = [
      `${client.guilds.cache.size} 個伺服器`,
      `${memberCount} 位用戶`,
      `/help`
    ];

    setInterval(() => {
      const status = activities[Math.floor(Math.random() * activities.length)];
      client.user.setPresence({ activities: [{ name: status, type: ActivityType.Watching }]});
    }, 5000);

    console.log(`${client.user.username} 已上線!`);
    loadCommands(client);

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

    console.log(`${client.user.username} 準備好ㄌ!`);
  },
};