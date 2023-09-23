const { EmbedBuilder, ChatInputCommandInteraction, Client } = require("discord.js");
const ms = require('ms');

module.exports = {
	subCommand: "giveaway.actions",
	/**
	 * @param {ChatInputCommandInteraction} interaction
	 * @param {Client} client
	 */
	execute(interaction, client) {
		const errEmbed = new EmbedBuilder()
			.setColor("Red");

		const successEmbed = new EmbedBuilder()
			.setColor("Green");

		const choices = interaction.options.getString("options");
		const messageId = interaction.options.getString("message-id");
		const giveaway = client.giveawaysManager.giveaways.find((g) => g.guildId === interaction.guildId && g.messageId === messageId);

		if (!giveaway) {
			errEmbed.setDescription(`無法在伺服器裡找到訊息ID: ${messageId} `)
			interaction.reply({ embeds: [errEmbed], ephemeral: true });
		}

		switch (choices) {
			case "end":
				{
					client.giveawaysManager.end(messageId).then(() => {
						successEmbed.setDescription("抽獎活動結束了!");
						interaction.reply({ embeds: [successEmbed], ephemeral: true });
					}).catch((err) => {
						errEmbed.setDescription(`發生錯誤: \n\`${err}\``)
						interaction.reply({ embeds: [errEmbed], ephemeral: true });
					});
				}
				break;
			case "pause":
				{
					client.giveawaysManager.pause(messageId).then(() => {
						successEmbed.setDescription("抽獎活動已經暫停了!");
						interaction.reply({ embeds: [successEmbed], ephemeral: true });
					}).catch((err) => {
						errEmbed.setDescription(`發生錯誤: \n\`${err}\``)
						interaction.reply({ embeds: [errEmbed], ephemeral: true });
					});
				}
				break;
			case "unpause":
				{
					client.giveawaysManager.unpause(messageId).then(() => {
						successEmbed.setDescription("抽獎活動進行中!");
						interaction.reply({ embeds: [successEmbed], ephemeral: true });
					}).catch((err) => {
						errEmbed.setDescription(`發生錯誤: \n\`${err}\``)
						interaction.reply({ embeds: [errEmbed], ephemeral: true });
					});
				}
				break;
			case "reroll":
				{
					client.giveawaysManager.reroll(messageId).then(() => {
						successEmbed.setDescription("抽獎活動已經重抽了!");
						interaction.reply({ embeds: [successEmbed], ephemeral: true });
					}).catch((err) => {
						errEmbed.setDescription(`發生錯誤: \n\`${err}\``)
						interaction.reply({ embeds: [errEmbed], ephemeral: true });
					});
				}
				break;
			case "delete":
				{
					client.giveawaysManager.delete(messageId).then(() => {
						successEmbed.setDescription("抽獎活動被刪除了!");
						interaction.reply({ embeds: [successEmbed], ephemeral: true });
					}).catch((err) => {
						errEmbed.setDescription(`發生錯誤: \n\`${err}\``)
						interaction.reply({ embeds: [errEmbed], ephemeral: true });
					});
				}
				break;
		}
	}
}