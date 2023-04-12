const { EmbedBuilder, ChatInputCommandInteraction, SlashCommandBuilder } = require("discord.js");
const rga = require("random-gif-api")

module.exports = {
		data: new SlashCommandBuilder()
    	.setName("hug")
	    .setDescription("擁抱某人!")
	    .addUserOption(option =>
				option
					.setName("member")
					.setDescription("提及你想擁抱的用戶")
					.setRequired(true)
			),
		usage: "/kiss <member>",
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const Target = interaction.options.getUser("member");
        const Executer = interaction.user;
        const data = await rga.getGif('cuddle');
        const HugEmbed = new EmbedBuilder()
            .setColor('#000000')
            .setDescription(`**${Executer} 給了 ${Target} 一個大大的擁抱**`)
            .setImage(data)
            .setTimestamp()

        if (Target.id === Executer.id) {
            Response = new MessageEmbed()
                .setColor('#000000')
                .setDescription("⛔ 你不能擁抱自己！")
            return interaction.reply({ embeds: [Response] })
        } else {
            interaction.reply({ embeds: [HugEmbed] });
        }
    }
}