const {
	SlashCommandBuilder,
	PermissionFlagsBits,
	ChatInputCommandInteraction,
	EmbedBuilder,
} = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("unban")
		.setDescription("解除封鎖一名成員")
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.setDMPermission(false)
		.addUserOption((options) =>
			options
				.setName("target")
				.setDescription("選擇一個成員")
				.setRequired(true)
		)
		.addStringOption((options) =>
			options
				.setName("reason")
				.setDescription("請提供理由")
				.setMaxLength(512)
				.setRequired(true)
		),
	/**
	 *
	 * @param {ChatInputCommandInteraction} interactions
	 */
	async execute(interaction, client) {
		const { options, guild, member } = interaction;

		const target = options.getMember("target");
		const reason = options.getString("reason");

		await interaction.guild.bans.fetch()
			.then(async bans => {

				if (bans.size == 0) return await interaction.reply({ content: "該名成員沒有被封鎖", ephermeral: true })
				let BannedID = bans.find(ban => ban.user.id == target);
				if (!BannedID) return await interaction.reply({ content: "指定的 id 未被此服務器禁止", ephermeral: true })

				interaction.guild.bans.remove(target, reason).catch((err) => {
					interaction.reply({
						content: "",
						ephermeral: true
					});
					return console.log("錯誤發生 - 在Unban.js", err);
				});

			})


		target.ban().catch((err) => {
			interaction.reply({
				content: "",
				ephermeral: true
			});
			return console.log("錯誤發生 - 在Unban.js", err);
		});

		const successEmbed = new EmbedBuilder()
			.setAuthor({
				name: `Unban Time`,
				iconURL: guild.iconURL(),
			})
			.setColor(client.color)
			.setThumbnail(
				"https://media.discordapp.net/attachments/1059607121194393671/1059923413650640987/295678623038211.png?width=285&height=296"
			)
			.setDescription(
				[
					`用戶: ${target}`,
					`執行人員: ${member}`,
					`\n原因: ${reason}`,
				].join("\n")
			)
			.setFooter({
				iconURL: guild.iconURL(),
				text: `機器人 | ${interaction.user.username}`,
			});
		return interaction.reply({ embeds: [successEmbed] });
	},
};