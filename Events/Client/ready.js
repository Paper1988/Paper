const { Client, EmbedBuilder } = require("discord.js");
const { connect } = require("mongoose");

const osUtils = require("os-utils");
const ms = require("ms");

const Database = require('../../Structures/Schemas/ClientDB');
const { loadCommands } = require("../../Structures/Handlers/commandHandler.js");

module.exports = {
    name: "ready",
    once: true,
    /**
     * @param {Client} client
     */
    async execute(client) {
        //client.user.setActivity(`在 ${client.guilds.cache.size} 個伺服器裡`);
				client.user.setActivity(`Updating 更新中....`);
				client.user.setStatus(`dnd`);
				console.log(`${client.user.username} 準備好ㄌ!`);
			
				loadCommands(client);

        const channel = client.channels.cache.get("961615076220092496");
        const Embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("狀態")
            .setDescription(`${client.user} 上線了`)
            .setFooter({ text: client.user.tag }).setTimestamp();

        channel.send({ embeds: [Embed] });

        require("../../Systems/LockDownSys")(client);

        if (!Database) return;
				connect(client.config.Database, {
				}).then(() => console.log(`✅ >>> 成功連結到 MongoDB!`));

        let memArray = [];

        setInterval(async() => {
            //Used Memory in GB
            memArray.push((osUtils.totalmem() - osUtils.freemem()) / 1024);

            if (memArray.length >= 14) {
                memArray.shift();
            }

            // Store in Database
            await Database.findOneAndUpdate({
                Client: true,
            }, {
                Memory: memArray,
            }, {
                upsert: true,
            });
        }, ms("5s")); //= 5000 (ms)
    }
}