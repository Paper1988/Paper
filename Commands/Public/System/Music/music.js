const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("music")
		.setDescription("一個完善的音樂系統")
		.addSubcommand((sub) =>
			sub
				.setName("play")
				.setDescription("▶ 播放音樂")
				.addStringOption((options) =>
					options
						.setName("query")
						.setDescription("請提供一個歌名或連結")
						.setRequired(true)
				)
		)
		.addSubcommand((sub) =>
			sub
				.setName("volume")
				.setDescription("🔊 調整音量大小")
				.addNumberOption((options) =>
					options
						.setName("percent")
						.setDescription("請提供一個音量(1 = 1%)")
						.setRequired(false)
				)
		).addSubcommand((sub) =>
			sub
				.setName("seek")
				.setDescription("⏭ 跳到指定位置")
				.addNumberOption((options) =>
					options
						.setName("time")
						.setDescription("請提供要跳到的位置（以秒為單位）")
						.setRequired(true)
				)
		)
		.addSubcommand((sub) =>
			sub
				.setName("settings")
				.setDescription("⚙歌曲設定")
				.addStringOption((options) =>
					options
						.setName("options")
						.setDescription("請選擇一個選項")
						.setRequired(true)
						.addChoices(
							{ name: "🔢 顯示播放清單", value: "queue" },
							{ name: "⏭ 跳過歌曲", value: "skip" },
							{ name: "⏸ 暫停播放歌曲", value: "pause" },
							{ name: "▶ 繼續播放歌曲", value: "resume" },
							{ name: "⏹ 停止音樂", value: "stop" },
							{ name: "🔀 隨機播放", value: "shuffle" },
							{ name: "🔃 切換自動播放", value: "autoplay" },
							{ name: "🈁 添加相關歌曲", value: "related" },
							{ name: "🔁 切換重複播放", value: "repeat" },
							{ name: "⏮ 播放上一首曲目", value: "previous" }
						)
				)
		),
	usage: "/music (play, volume, settings, seek, filters)",
}