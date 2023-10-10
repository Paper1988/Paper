const { ChatInputCommandInteraction, Client } = require("discord.js");
const ms = require('ms');

module.exports = {
	subCommand: "music.filters",
	/**
	 * @param {ChatInputCommandInteraction} interaction
	 * @param {Client} client
	 */
	async execute(interaction, client) {
		const { options, member } = interaction;
		const VoiceChannel = member.voice.channel;

		if (!VoiceChannel)
			return interaction.reply({ content: "> 你必須待在一個語音頻道裡面才能使用音樂指令!", ephemeral: true });
		if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
			return interaction.reply({ content: `> 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`, ephemeral: true });

		const queue = await client.distube.getQueue(VoiceChannel);

		if (!queue)
			return interaction.reply({ content: "⛔ 找不到清單" });

		switch (options.getString("set")) {
			case "false":
				await queue.filters.clear();
				return interaction.reply({ content: `❎ 成功關閉所有過濾器` });

			case "8d":
				await queue.setFilter(`3d`);
				return interaction.reply({ content: `✅ 成功增加 8D 過濾器` });

			case "karaoke":
				await queue.setFilter(`karaoke`);
				return interaction.reply({ content: `✅ 成功增加 OK 過濾器` });

			case "vaporwave":
				await queue.setFilter(`vaporwave`);
				return interaction.reply({ content: `✅ 成功增加 vaporwave 過濾器` });

			case "flanger":
				await queue.setFilter(`flanger`);
				return interaction.reply({ content: `✅ 成功增加 flanger 過濾器` });

			case "gate":
				await queue.setFilter(`gate`);
				return interaction.reply({ content: `✅ 成功增加 gate 過濾器` });

			case "haas":
				await queue.setFilter(`haas`);
				return interaction.reply({ content: `✅ 成功增加 haas 過濾器` });

			case "reverse":
				await queue.setFilter(`reverse`);
				return interaction.reply({ content: `✅ 成功增加 倒放 過濾器` });

			case "mcompand":
				await queue.setFilter(`mcompand`);
				return interaction.reply({ content: `✅ 成功增加 mcompand 過濾器` });

			case "phaser":
				await queue.setFilter(`phaser`);
				return interaction.reply({ content: `✅ 成功增加 phaser 過濾器` });

			case "tremolo":
				await queue.setFilter(`tremolo`);
				return interaction.reply({ content: `✅ 成功增加 tremolo 過濾器` });

			case "earwax":
				await queue.setFilter(`earwax`);
				return interaction.reply({ content: `✅ 成功增加 erawax 過濾器` });

			case "bassboost":
				await queue.setFilter(`bassboost`);
				return interaction.reply({ content: `✅ 成功增加 低音增強 過濾器` });

			case "echo":
				await queue.setFilter(`echo`);
				return interaction.reply({ content: `✅ 成功增加 迴音 過濾器` });

			case "nightcore":
				await queue.setFilter(`nightcore`);
				return interaction.reply({ content: `✅ 成功增加 nightcore 過濾器` });

			case "surround":
				await queue.setFilter(`surround`);
				return interaction.reply({ content: `✅ 成功增加 環繞聲 過濾器` });
		}
	}
}