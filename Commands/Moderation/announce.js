const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("announce")
    .setDescription("通過機器人公告某事!")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false)
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("將您的公告標題放在這裡!")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("輸入您要宣布的訊息(輸入\\n來換行)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("color")
        .setDescription("自定義您的嵌入顏色! (請使用六進位制色碼，例如: #00ff00)")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("footer")
        .setDescription("為您的公告添加頁腳!")
        .setRequired(false)
    )
    .addBooleanOption((option) =>
      option
        .setName("timestamp")
        .setDescription("是否啟用時間戳?")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("ping")
        .setDescription("對您的公告消息的附加標註")
        .setRequired(false)
        .addChoices(
          { name: "@everyone", value: "@everyone" },
          { name: "@here", value: "@here" }
        )
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options, user } = interaction;
    const title = options.getString("title");
    const message = options.getString("description");
    const color = options.getString("color");
    const footer = options.getString("footer");
    const timestamp = options.getBoolean("timestamp");
    const ping = options.getString("ping");

    const splitedMsg = await message.replace(/\\n/g, '\n');

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${user.tag}`,
        iconURL: `${user.displayAvatarURL({ dynamic: true })}`,
      })
      .setTitle(`${title}`)
      .setDescription(`${message}`);

    if (color) embed.setColor(color[0].toUpperCase());
    if (footer) embed.setFooter({ text: footer });
    if (timestamp) embed.setTimestamp();

    if (!ping) {
      interaction.reply({
        embeds: [embed],
      });
    } else {
      interaction.reply({
        content: `${ping === "@everyone" ? "@everyone" : "@here"}`,
        embeds: [embed],
        allowedMentions: {
          parse: ["everyone"],
        },
      });
    }
  },
};
