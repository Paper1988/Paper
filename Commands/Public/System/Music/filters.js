const { ChatInputCommandInteraction, Client } = require("discord.js");
const ms = require('ms');

module.exports = {
	subCommand: "music.filter",
	/**
	 * @param {Client} client
	 * @param {ChatInputCommandInteraction} interaction
	 */
	async execute(client, interaction) {
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
				await queue.setFilter(false);
				return interaction.reply({ content: `❎ 成功禁用所有過濾器` });

			case "8d":
				await queue.setFilter(`3d`);
				return interaction.reply({ content: `✅ 成功切換到 8D 過濾器` });

			case "karaoke":
				await queue.setFilter(`karaoke`);
				return interaction.reply({ content: `✅ 成功切換到 OK 過濾器` });

			case "vaporwave":
				await queue.setFilter(`vaporwave`);
				return interaction.reply({ content: `✅ 成功切換到 蒸汽波 過濾器` });

			case "flanger":
				await queue.setFilter(`flanger`);
				return interaction.reply({ content: `✅ 成功切換到 鑲邊 過濾器` });

			case "gate":
				await queue.setFilter(`gate`);
				return interaction.reply({ content: `✅ 成功切換到 門 過濾器` });

			case "haas":
				await queue.setFilter(`haas`);
				return interaction.reply({ content: `✅ 成功切換到 haas 過濾器` });

			case "reverse":
				await queue.setFilter(`reverse`);
				return interaction.reply({ content: `✅ 成功切換到 反向 過濾器` });

			case "mcompand":
				await queue.setFilter(`mcompand`);
				return interaction.reply({ content: `✅ 成功切換到 mcompand 過濾器` });

			case "phaser":
				await queue.setFilter(`phaser`);
				return interaction.reply({ content: `✅ 成功切換到 移相器 過濾器` });

			case "tremolo":
				await queue.setFilter(`tremolo`);
				return interaction.reply({ content: `✅ 成功切換到 顫音 過濾器` });

			case "earwax":
				await queue.setFilter(`earwax`);
				return interaction.reply({ content: `✅ 成功切換到 耳垢 過濾器` });

			case "bassboost":
				await queue.setFilter(`bassboost`);
				return interaction.reply({ content: `✅ 成功切換到 低音增強 過濾器` });

			case "echo":
				await queue.setFilter(`echo`);
				return interaction.reply({ content: `✅ 成功切換到 迴聲 過濾器` });

			case "nightcore":
				await queue.setFilter(`nightcore`);
				return interaction.reply({ content: `✅ 成功切換到 nightcore 過濾器` });

			case "surround":
				await queue.setFilter(`surround`);
				return interaction.reply({ content: `✅ 成功切換到 環繞聲 過濾器` });
		}
	}
}