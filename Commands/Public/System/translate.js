const translate = require(`@iamtraction/google-translate`);
const { EmbedBuilder, CommandInteraction, SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('translate')
		.setDescription('將任何文字翻譯成你想要的任何語言')
		.addStringOption((option) => option.setName("language").setDescription("你想要翻成的語言").addChoices(
			{ name: "Arabic(阿拉伯文)", value: "ar" },
			{ name: "German(德文)", value: "de" },
			{ name: "English(英文)", value: "en" },
			{ name: "Spanish(西班牙文)", value: "es" },
			{ name: "French(法文)", value: "fr" },
			{ name: "Greek(希臘文)", value: "gl" },
			{ name: "Italian(義大利文)", value: "it" },
			{ name: "Japanese(日文)", value: "ja" },
			{ name: "Latin(拉丁文)", value: "la" },
			{ name: "Portugese(葡萄牙文)", value: "pt" },
			{ name: "Russian(俄羅斯文)", value: "ru" },
			{ name: "Dutch(荷蘭文)", value: "nl" },
			{ name: "Chinese Traditional(中文-繁體)", value: "zh-tw" },
			{ name: "Chinese Simplified(中文-簡體)", value: "zh-cn" }
		).setRequired(true))
		.addStringOption(option => option.setName("message").setDescription("要翻譯的訊息").setRequired(true)),
	/**
	 * @param {CommandInteraction} interaction
	 */
	async execute(interaction) {
		const la = interaction.options.getString(`language`);
		const text = interaction.options.getString(`message`);

		console.log(la.name)
		await interaction.reply({ content: "> 正在翻譯你的訊息...", ephemeral: true });

		await translate(text, { to: `${la}` })
			.then((res) => {
				const successEmbed = new EmbedBuilder()
				.setTitle(`🔍 成功翻譯訊息`)
				.setDescription(`${la}`)
				.setColor(`Green`)
				.setTimestamp()
				.addFields(
					{ name: `翻譯前: `, text: `\`\`\`${text}\`\`\``, inline: false },
					{ name: `翻譯後: `, text: `\`\`\`${res.text}\`\`\``, inline: false },
					{ name: `語言: `, text: `${la}`, inline: false }
				)
				interaction.editReply({ content: "", embeds: [successEmbed], ephemeral: true });
			}).catch((err) => {
				interaction.editReply({ content: `> ${err.message}`, ephemeral: true });
			});

		
	},
};