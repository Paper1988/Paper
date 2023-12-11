const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonStyle,
  ButtonBuilder,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} = require("discord.js");
const mal = require("mal-scraper");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("anime")
    .setDescription("💮 搜尋動漫資訊")
    .addStringOption((option) =>
      option.setName("query").setDescription("動漫名稱").setRequired(true)
    ),
  /**
   * @param { ChatInputCommandInteraction } interaction
   */
  async execute(interaction) {
    const search = interaction.options.getString("query");
    await interaction.deferReply();
    mal.getInfoFromName(search).then((data) => {
      const embed = new EmbedBuilder()
        .setAuthor({ name: `動漫搜尋結果: ${search}` })
        .setImage(data.picture)
        .setColor("#5865F2")
        .addFields(
          { name: "英文標題", value: `${data.englishTitle || "無!"}` },
          { name: "日文標題", value: `${data.japaneseTitle || "無!"}` },
          { name: "類型", value: `${data.type || "無!"}` },
          { name: "集數", value: `${data.episodes || "無!"}` },
          { name: "分數", value: `${data.score || "無!"}` },
          { name: "分級", value: `${data.rating || "無!"}` },
          { name: "上映", value: `${data.aired || "無!"}` }
        )
        .setFooter({
          text: `由 ${interaction.user.username} 查詢`,
          iconURL: interaction.user.displayAvatarURL({
            dynamic: true,
            format: "png",
            size: 2048,
          }),
        })
        .setTimestamp();
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setURL(data.url)
          .setLabel("查看更多")
      );
      interaction.followUp({ embeds: [embed], components: [row] });
    });
  },
};
