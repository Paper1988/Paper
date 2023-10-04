const client = require("../../index.js");
const { EmbedBuilder } = require("discord.js");

const status = queue =>
	`音量: \`${queue.volume}%\` | 過濾器: \`${queue.filters.isArray() || '關'}\` | 重複播放: \`${queue.repeatMode ? (queue.repeatMode === 2 ? '整個清單' : '單曲') : '關'
	}\` | 自動播放: \`${queue.autoplay ? '開' : '關'}\``

client.distube
	.on('playSong', (queue, song) =>
		queue.textChannel.send({
			embeds: [new EmbedBuilder()
				.setColor("Green")
				.setDescription(`🎶 | 播放 \`${song.name}\` - \`${song.formattedDuration}\`\n請求者: ${song.user}\n${status(queue)}`)
			]
		})
	)
	.on('addSong', (queue, song) =>
		queue.textChannel.send({
			embeds: [new EmbedBuilder()
				.setColor("Green")
				.setDescription(`> ✅ | ${song.user} 加入 ${song.name} - \`${song.formattedDuration}\` 到清單中`)
			]
		})
	)
	.on('addList', (queue, playlist) =>
		queue.textChannel.send({
			embeds: [new EmbedBuilder()
				.setColor("Green")
				.setDescription(`> ✅ | 加入 \`${playlist.name}\` 播放清單 (${playlist.songs.length} 首歌) 到清單中\n${status(queue)}`)
			]
		})
	)
	
	.on('error', (channel, e) => {
		channel.send({
			embeds: [new EmbedBuilder()
				.setColor("Red")
				.setDescription(`> ⛔ | 發生錯誤: ${e.toString().slice(0, 1974)}`)
			]
		})
		console.error(e)
	})
	
	.on("empty", queue => queue.textChannel.send({
		embeds: [new EmbedBuilder()
			.setColor("Red")
			.setDescription('> 語音頻道是空的！離開頻道中...')
		]
		})
	)

	.on('searchNoResult', (message, query) =>
		message.channel.send({
			embeds: [new EmbedBuilder()
				.setColor("Red")
				.setDescription(`> ⛔ | 沒有找到結果: \`${query}\`!`)
			]
		})
	)

	.on('finish', queue => queue.textChannel.send({
		embeds: [new EmbedBuilder()
			.setColor("Red")
			.setDescription(`> 清單播放完畢！離開頻道中...`)
		]
		})
	)