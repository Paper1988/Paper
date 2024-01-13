const { Client, EmbedBuilder, ActivityType } = require("discord.js");
const { connect } = require("mongoose");

const { loadCommands } = require("../../Structures/Handlers/commandHandler.js");

module.exports = {
  name: "ready",
  once: true,
  /**
   * @param {Client} client
   */
  async execute(client) {
    client.user.setActivity(`${client.guilds.cache.size} 個伺服器`, { type: ActivityType.Watching });
    // client.user.setActivity(`Updating 更新中....`);
    client.user.setStatus(`online`);
		console.log(`${client.user.username} 已上線!`);
    loadCommands(client);
		connect(client.config.Database, {}).then(() =>
			console.log(`✅ >>> 成功連結到 MongoDB!`)
		);
		
		console.log(`${client.user.username} 準備好ㄌ!`);
    const channel = client.channels.cache.get("961615076220092496");
    const Embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("狀態")
      .setDescription(`${client.user} 上線了!`)
      .setFooter({ text: client.user.tag })
      .setTimestamp();

    channel.send({ embeds: [Embed] });
  },
};
