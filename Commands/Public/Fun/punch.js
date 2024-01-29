const {
  EmbedBuilder,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const rga = require("random-gif-api");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("punch")
    .setDescription("揍爆某人!")
    .addUserOption((option) =>
      option
        .setName("member")
        .setDescription("提及你想揍爆的用戶")
        .setRequired(true)
    ),
  usage: "/punch <member>",
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const Target = interaction.options.getUser("member");
    const Executer = interaction.user;
    const data = await rga.getGif("punch");
    const HugEmbed = new EmbedBuilder()
      .setColor("#000000")
      .setDescription(`**${Executer} 揍了一頓 ${Target}**`)
      .setImage(data)
      .setTimestamp();

    if (Target.id === Executer.id) {
      Response = new MessageEmbed()
        .setColor("#000000")
        .setDescription("<:icons_outage:868122243845206087> | 你不能揍你自己！");
      return interaction.reply({ embeds: [Response] });
    } else {
      interaction.reply({ embeds: [HugEmbed] });
    }
  },
};
