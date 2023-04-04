const { CommandInteraction, Client, EmbedBuilder } = require("discord.js");

module.exports = {
    name: 'guildCreate',
    /**
     * @param {CommandInteraction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        const guild = interaction;

        const Embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("❤ | Paper加入了新的伺服器")
            .setDescription(`${client.user.tag} 被邀進了新的伺服器`)
            .setFields({ name: "伺服器名稱:", value: `${guild.name}`, inline: true }, { name: "成員數量:", value: `${guild.memberCount}`, inline: true }, { name: "伺服器總數", value: `${client.guilds.cache.size}` }, { name: "用戶總數", value: `${client.users.cache.size}` })
            .setTimestamp();

        const logC = client.channels.cache.get("961615076740194326");

        logC.send({ embeds: [Embed] });
    },
};