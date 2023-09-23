const translate = require(`@iamtraction/google-translate`);
const { EmbedBuilder, Client, CommandInteraction, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('translate')
        .setDescription('將任何句子翻譯成你想要的任何語言')
        .addStringOption((option) => option.setName("lang_name").setDescription("你想要翻成的語言").setRequired(true))
        .addStringOption((option) => option.setName("the_message").setDescription("要翻譯的訊息").setRequired(true)),
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    async execute(interaction, client) {
        const la = interaction.options.getString(`lang_name`);
        const msg = interaction.options.getString(`the_message`);

        translate(msg, { to: la })
            .then((res) => {
                var ee = new EmbedBuilder()
                    .setTitle(`翻譯系統`)
                    .setColor(`Blue`)
                    .setTimestamp()
                    .addFields(
											{name:`翻譯前: `, text:`${msg}`},
											{name:`翻譯後: `, text:`${res.text}`},
											{name:`語言: `, text:`${la}`}
										)
                interaction.reply({ embeds: [ee] });
            })
            .catch((err) => {
                interaction.reply({ content: `${err.message}`, ephemeral: true });
            });
    },
};