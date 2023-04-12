const { EmbedBuilder, ChatInputCommandInteraction, SlashCommandBuilder } = require("discord.js");
const rga = require("random-gif-api");

module.exports = {
		data: new SlashCommandBuilder()
    	.setName("kiss")
	    .setDescription("親吻某人!")
	    .addUserOption(option =>
				option
					.setName("member")
					.setDescription("提及你想親吻的用戶")
	        .setRequired(true)
			),
		usage: "/kiss <member>",
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const Target = interaction.options.getUser("member");
        const Executer = interaction.user;
        const data = await rga.getGif('kiss');
        const kissEmbed = new EmbedBuilder()
            .setColor('#000000')
            .setDescription(`**${Executer} 親了 ${Target}**`)
            .setImage(data)
            .setTimestamp()

        if (Target.id === Executer.id) {
            Response = new EmbedBuilder()
                .setColor('#000000')
                .setDescription("⛔ 你不能親吻自己！")
            return interaction.reply({ embeds: [Response] });
        } else {
            interaction.reply({ embeds: [kissEmbed] });
        }
    }
}