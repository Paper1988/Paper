const { CommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, SlashCommandBuilder } = require("discord.js");
const client = require("../../../index.js"); // - path to your index.js, you need to have ( module.exports = client; ) in your index.js

module.exports = {
	data: new SlashCommandBuilder()
		.setName("report")
		.setDescription("回報給我們訊息")
		.addStringOption(options => 
			options.setName("類別")
				.setDescription("選擇類別")
				.setRequired(true)
				.addChoices(
					{
						name: "🐞| Bug",
						value: "bug"
					},
					{
						name: "💡| 建議",
						value: "suggestion"
					},
					{
						name: "🌀| 其他",
						value: "other"
					}
				)
		)
		.addStringOption(options => 
			options.setName("敘述")
				.setDescription("請盡可能清楚地描述你遭遇的bug或你想提供的建議")
				.setRequired(true)
		)
		.addStringOption(options => 
			options.setName("指令")
				.setDescription("這是個指令造成的bug嗎?")
				.setRequired(true)
		)
		.addAttachmentOption(options =>
			options.setName("圖片")
				.setDescription("新增圖片")
				.setRequired(false)
		)
		,usage: "/report [內容]",
	/**
	 * @param {Client} client
	 * @param {CommandInteraction} interaction 
	 */
	async execute(interaction, client) {
		const type = interaction.options.getString("type")
		const description = interaction.options.getString("description")
		const command = interaction.options.getString("command")
		const picture = (interaction.options.getAttachment("picture") || "")
		const guild = interaction.guild

		const sch = client.channels.cache.get("975253353913254029");

		const send_m = new EmbedBuilder()
			.setTitle(`✅| 你的回報已成功提交!`)
			.setColor("Green")

		const cancel_m = new EmbedBuilder()
			.setTitle(`⛔️| 你的回報提交失敗或取消!`)
			.setColor("Red")

		/**
		const more_info = new EmbedBuilder() //You can use this if you want to get more info of the user that sent the report
			.setTitle(`更多資訊`)
			.setColor("Random")
			.addFields({name:`回報者ID:`,value:`\`\`\`${interaction.user.id}\`\`\``, inline: false})
			.addFields({name:`伺服器ID:`,value:`\`\`\`${guild.id}\`\`\``, inline: false}) 
		*/

		const send_button = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('send_button')
					.setLabel(`✅| 提交回報`)
					.setStyle("Success")
			)
		const cancel_button = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('cancel_button')
					.setLabel(`⛔️| 取消`)
					.setStyle("Danger")
			)

		if (type == "bug") {
			const embed = new EmbedBuilder()
				.setTitle("🐞| Bug")
				.setColor("Red")
				.setDescription(`提交者: ${interaction.user}  (伺服器: ${guild.name})`)
				.addFields({ name: `提供的描述:`, value: `\`\`\`${description}\`\`\``, inline: true })
				.addFields({ name: `造成bug的指令:`, value: `\`\`\`${command || `Not selected`}\`\`\``, inline: false })
				.setThumbnail(picture.url)
				.setTimestamp()

			const message = await interaction.reply({ content: `回報預覽:`, embeds: [embed], components: [cancel_button, send_button], fetchReply: true, ephemeral: true })
			const collector = message.createMessageComponentCollector();

			collector.on('collect', async ButtonInteraction => {
				if (ButtonInteraction.customId == 'send_button') {
					await sch.send({ embeds: [embed] });
					ButtonInteraction.update({ embeds: [send_m], components: [] })
				}
			});
			collector.on('collect', async ButtonInteraction => {
				if (ButtonInteraction.customId == 'cancel_button') {
					await ButtonInteraction.update({ embeds: [cancel_m], components: [] })
				}
			});

		}
		else if (type == "suggestion") {
			const embed = new EmbedBuilder()
				.setTitle("💡| 建議")
				.setColor("Yellow")
				.setDescription(`提交者: ${interaction.user}  (伺服器: ${guild.name})`)
				.addFields({ name: `提供的敘述:`, value: `\`\`\`${description}\`\`\``, inline: true })
				.setThumbnail(picture.url)
				.setTimestamp()

			const message = await interaction.reply({ content: `建議預覽:`, embeds: [embed], components: [cancel_button, send_button], fetchReply: true, ephemeral: true })
			const collector = message.createMessageComponentCollector()


			collector.on('collect', async ButtonInteraction => {
				if (ButtonInteraction.customId == 'send_button') {
					await sch.send({ embeds: [embed] });
					ButtonInteraction.update({ embeds: [send_m], components: [] })
				}
			})
			collector.on('collect', async ButtonInteraction => {
				if (ButtonInteraction.customId == 'cancel_button') {
					await ButtonInteraction.update({ embeds: [cancel_m], components: [] })
				}
			})
		}
		else {
			const embed = new EmbedBuilder()
				.setTitle("🌀| 其他")
				.setColor("Purple")
				.setDescription(`提交者: ${interaction.user}  (伺服器: ${guild.name})`)
				.addFields({ name: `提供的描述:`, value: `\`\`\`${description}\`\`\``, inline: true })
				.setThumbnail(picture.url)
				.setTimestamp()

			const message = await interaction.reply({ content: `回報預覽:`, embeds: [embed], components: [cancel_button, send_button], fetchReply: true, ephemeral: true });
			const collector = message.createMessageComponentCollector();

			collector.on('collect', async ButtonInteraction => {
				if (ButtonInteraction.customId == 'send_button') {
					await sch.send({ embeds: [embed] });
					ButtonInteraction.update({ embeds: [send_m], components: [] })
				}
			})
			collector.on('collect', async ButtonInteraction => {
				if (ButtonInteraction.customId == 'cancel_button') {
					await ButtonInteraction.update({ embeds: [cancel_m], components: [] })
				}
			})
		}
	}
}