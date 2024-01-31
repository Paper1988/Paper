const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} = require("discord.js");
const rga = require("random-gif-api");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pat")
    .setDescription("摸某人!")
    .addUserOption((option) =>
      option
        .setName("member")
        .setDescription("提及您要摸的用戶")
        .setRequired(true)
    ),
  usage: "/pat <member>",
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const Target = interaction.options.getMember("member");
    const Executer = interaction.user;
    const data = await rga.getGif("pat");
    const patEmbed = new EmbedBuilder()
      .setColor("#000000")
      .setDescription(`**${Executer} 摸了一下 ${Target}**`)
      .setImage(data)
      .setTimestamp();

    if (Target.id === Executer.id) {
      Response = new EmbedBuilder()
        .setColor("#000000")
        .setDescription("<:outage_868122243845206087:1202112862990897172> | 你不能摸你自己!");
      return interaction.reply({ embeds: [Response] });
    } else {
      interaction.reply({ embeds: [patEmbed] });
    }
  },
};
