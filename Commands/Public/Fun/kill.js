const {
  EmbedBuilder,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const rga = require("random-gif-api");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kill")
    .setDescription("殺掉某人!")
    .addUserOption((option) =>
      option
        .setName("member")
        .setDescription("提及你想殺掉的用戶")
        .setRequired(true)
    ),
  usage: "/kill <member>",
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const Target = interaction.options.getUser("member");
    const Executer = interaction.user;
    const data = await rga.getGif("kill");
    const HugEmbed = new EmbedBuilder()
      .setColor("#000000")
      .setDescription(`**${Executer} 殺了 ${Target}**`)
      .setImage(data)
      .setTimestamp();

    if (Target.id === Executer.id) {
      Response = new MessageEmbed()
        .setColor("#000000")
        .setDescription("⛔ 你不能殺掉你自己！");
      return interaction.reply({ embeds: [Response] });
    } else {
      interaction.reply({ embeds: [HugEmbed] });
    }
  },
};
