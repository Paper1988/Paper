const { EmbedBuilder, ChatInputCommandInteraction, Client } = require("discord.js");
const ms = require('ms');

module.exports = {
	subCommand: "music.settings",
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

		switch (options.getString("options")) {
			case "skip":
				await queue.skip(VoiceChannel);
				return interaction.reply({ content: "> ⏭ 成功跳過歌曲" });

			case "stop":
				await queue.stop(VoiceChannel);
				return interaction.reply({ content: "> ⏹ 成功停止音樂並退出語音頻道" });

			case "pause":
				await queue.pause(VoiceChannel);
				return interaction.reply({ content: "> ⏸ 成功暫停播放歌曲" });

			case "resume":
				await queue.resume(VoiceChannel);
				return interaction.reply({ content: "> ▶ 成功繼續播放歌曲" });

			case "shuffle":
				await queue.shuffle(VoiceChannel);
				return interaction.reply({ content: "> 🔀 成功隨機播放歌曲" });

			case "autoplay":
				let Mode = await queue.toggleAutoplay(VoiceChannel);
				return interaction.reply({ content: `> 🔃 成功切換自動播放模式為: ${Mode ? "開" : "關"}` });

			case "previous":
				await queue.previous(VoiceChannel);
				return interaction.reply({ content: "> ⏮ 成功播放上一首曲目" });

			case "related":
				await queue.addRelatedSong(VoiceChannel);
				return interaction.reply({ content: "> 🈁 成功添加一個相關歌曲到播放清單中" });

			case "repeat":
				let Mode2 = await client.distube.setRepeatMode(queue);
				return interaction.reply({ content: `> 🔃 成功切換重複播放模式為: \`${Mode2 = Mode2 ? Mode2 == 2 ? '整個清單' : '單曲' : '關閉'}\`` });

			case "queue":
				return interaction.reply({
					embeds: [new EmbedBuilder()
						.setColor("Purple")
						.setDescription(`${queue.songs.slice(0, 10).map((song, id) => `\n**${id + 1}**. ${song.name} - \`${song.formattedDuration}\``)}`)]
				});
		}
	}
}