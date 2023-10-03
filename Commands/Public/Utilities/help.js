const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName("help")
		.setDescription("顯示完整的指令列表"),
	async execute(interaction) {
		const helpmenu = new ActionRowBuilder()
			.addComponents(
				new StringSelectMenuBuilder()
					.setCustomId("menu")
					.setPlaceholder("選擇一個分類")
					.addOptions(
						{
							label: "🔧功能",
							description: "顯示所有功能指令",
							value: "menu1"
						},

						{
							label: "🔒管理",
							description: "顯示所有管理指令(只有管理員和版主等人可以使用)",
							value: "menu2"
						},

						{
							label: "🎶音樂",
							description: "顯示所有音樂指令",
							value: "menu3"
						},

						{
							label: "🎁抽獎",
							description: "顯示所有抽獎指令",
							value: "menu4"
						},
					),
			);

		const funbutton = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId("funbutton")
					.setLabel("娛樂指令")
					.setStyle(ButtonStyle.Secondary)
			)

		const generalcommands = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId("back")
					.setLabel("返回")
					.setStyle(ButtonStyle.Primary)
			)

		const inviteme = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setLabel("邀請我")
					.setStyle(ButtonStyle.Link)
					.setURL("https://discord.com/api/oauth2/authorize?client_id=***REMOVED***&permissions=1644971945463&scope=bot%20applications.commands")
			)

		const embed = new EmbedBuilder()
			.setColor("Blue")
			.setDescription("Paper是一個多功能機器人，有許多指令，像是：音樂、抽獎、管理以及更多有趣的指令等你來發現！")
			.setTimestamp()

		const publicem = new EmbedBuilder()
			.setTitle("🔧功能")
			.setColor("Green")
			.setDescription("`/help`: 顯示這個列表\n`/botinfo`: 顯示有關Paper的資訊\n`/ping`: Pong!\n`/invite`: 顯示Paper的邀請指令\n`/status`: 檢查機器人的狀態\n`/serverinfo`: 顯示伺服器的資訊\n`/userinfo`: 取得一位用戶的資訊\n\`/report\`: 回報給我們訊息(bug、建議等)")
			.setTimestamp()

		const modem = new EmbedBuilder()
			.setTitle("🔒管理")
			.setColor("Red")
			.setDescription("\`/ban\`: 停權一名成員\n\`/unban\`: 對一名成員解除停權\n\`/kick\`: 踢除一名成員\n\`/mute\`: 禁言一名成員\n\`/unmute\`: 對一名成員解除禁言\n\`/purge\`: 刪除頻道內訊息")
			.setTimestamp()

		const musicem = new EmbedBuilder()
			.setTitle("🎶音樂")
			.setColor("Purple")
			.setDescription(
				"\`/play\`: 提供連結或關鍵字來播放音樂或影片\n\`/seek\`: 調整音樂當前秒數\n\`/settings\`: 設定功能\n\`/filter\`: 使用過濾器\n\`/volume\`: 調整音量"
			)
			.setTimestamp()

		const giveem = new EmbedBuilder()
			.setTitle("🎁抽獎")
			.setColor("Gold")
			.setDescription(
				"\`/start\`: 設定一次抽獎活動\n\`/action\`: 調整抽獎活動的參數\n"
			)
			.setTimestamp()

		const message = await interaction.reply({ embeds: [embed], components: [helpmenu, inviteme] })

		const collector = await message.createMessageComponentCollector()

		collector.on(`collect`, async (i) => {
			if (i.customId === 'menu') {
				const value = i.values[0];
				if (i.user.id !== interaction.user.id) {
					return await i.reply({ content: `只有 ${interaction.user.tag} 才能使用這個選單!`, ephemeral: true })
				}
				if (value === "menu1") {
					await i.update({ embeds: [publicem], components: [helpmenu, inviteme] })
				}

				if (value === "menu2") {
					await i.update({ embeds: [modem], components: [helpmenu, inviteme] })
				}

				if (value === "menu3") {
					await i.update({ embeds: [musicem], components: [helpmenu, inviteme] })
				}

				if (value === "menu4") {
					await i.update({ embeds: [giveem], components: [helpmenu, inviteme] })
				}
			}

			if (i.customId === "funbutton") {
				if (i.user.id !== interaction.user.id) {
					return await i.reply({ content: `只有 ${interaction.user.tag} 可以使用這些按鈕!`, ephemeral: true })
				}
				await i.update({ embeds: [funem], components: [helpmenu, generalcommands, inviteme] })
			}

			if (i.customId === "back") {
				if (i.user.id !== interaction.user.id) {
					return await i.reply({ content: `只有 ${interaction.user.tag} 可以使用這些按鈕!`, ephemeral: true })
				}
				await i.update({ embeds: [publicem], components: [helpmenu, funbutton, inviteme] })
			}

		})
	}
}