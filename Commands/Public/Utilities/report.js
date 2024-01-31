const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  SlashCommandBuilder,
} = require("discord.js");
const client = require("../../../index.js"); // - path to your index.js, you need to have ( module.exports = client; ) in your index.js

module.exports = {
  data: new SlashCommandBuilder()
    .setName("report")
    .setDescription("回報給我們訊息")
    .addStringOption((options) =>
      options
        .setName("type")
        .setDescription("選擇類別")
        .setRequired(true)
        .addChoices(
          {
            name: "🐞| Bug",
            value: "bug",
          },
          {
            name: "💡| 建議",
            value: "suggestion",
          },
          {
            name: "🌀| 其他",
            value: "other",
          }
        )
    )
    .addStringOption((options) =>
      options
        .setName("description")
        .setDescription("請盡可能清楚地描述你遭遇的bug或你想提供的建議")
        .setRequired(true)
    )
    .addStringOption((options) =>
      options
        .setName("command")
        .setDescription("這是哪個指令造成的bug?\n若是建議則不需要填")
        .setRequired(false)
    )
    .addAttachmentOption((options) =>
      options.setName("picture").setDescription("新增圖片").setRequired(false)
    ),
  usage: "/report [內容]",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const type = interaction.options.getString("type");
    const description = interaction.options.getString("description");
    const command = interaction.options.getString("command");
    const picture = interaction.options.getAttachment("picture") || "";
    const guild = interaction.guild;

    const sch = client.channels.cache.get("975253353913254029");

    const send_m = new EmbedBuilder()
      .setTitle(`<:correct_859388130411282442:1201843648229294121> | 你的回報已成功提交!`)
      .setColor("Green");

    const cancel_m = new EmbedBuilder()
      .setTitle(`<:outage_868122243845206087:1202112862990897172> | 你的回報提交失敗或取消!`)
      .setColor("Red");

    /**
		const more_info = new EmbedBuilder() //You can use this if you want to get more info of the user that sent the report
			.setTitle(`更多資訊`)
			.setColor("Random")
			.addFields({name:`回報者ID:`,value:`\`\`\`${interaction.user.id}\`\`\``, inline: false})
			.addFields({name:`伺服器ID:`,value:`\`\`\`${guild.id}\`\`\``, inline: false}) 
		*/

    const send_button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("send_button")
        .setLabel(`<:correct_859388130411282442:1201843648229294121>提交回報`)
        .setStyle("Success")
    );
    const cancel_button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("cancel_button")
        .setLabel(`<:icons_xmarkwhite:988409378161954866>取消`)
        .setStyle("Danger")
    );

    switch (type) {
      case "bug":
        {
          const B_embed = new EmbedBuilder()
            .setTitle("<:icons_Bugs:859388130803974174> | Bug")
            .setColor("Red")
            .setDescription(
              `提交者: ${interaction.user}  (伺服器: ${guild.name})`
            )
            .addFields(
              {
                name: `提供的描述:`,
                value: `\`\`\`${description}\`\`\``,
                inline: true,
              },
              {
                name: `造成bug的指令:`,
                value: `\`\`\`${command || `無選擇`}\`\`\``,
                inline: false,
              }
            )
            .setThumbnail(picture.url)
            .setTimestamp();

          const Bmessage = await interaction.reply({
            content: `預覽:`,
            embeds: [B_embed],
            components: [cancel_button, send_button],
            ephemeral: true,
          });
          const clr = Bmessage.createMessageComponentCollector();

          clr.on("collect", async (ButtonInteraction) => {
            if (ButtonInteraction.customId == "send_button") {
              await sch.send({ embeds: [B_embed] });
              ButtonInteraction.update({
                content: "",
                embeds: [send_m],
                components: [],
              });
            }
          });
          clr.on("collect", async (ButtonInteraction) => {
            if (ButtonInteraction.customId == "cancel_button") {
              await ButtonInteraction.update({
                content: "",
                embeds: [cancel_m],
                components: [],
              });
            }
          });
        }
        break;
      case "suggestion":
        {
          const S_embed = new EmbedBuilder()
            .setTitle("<:icons_bulb:882595243579559958> | 建議")
            .setColor("Yellow")
            .setDescription(
              `提交者: ${interaction.user}  (伺服器: ${guild.name})`
            )
            .addFields({
              name: `提供的敘述:`,
              value: `\`\`\`${description}\`\`\``,
              inline: true,
            })
            .setThumbnail(picture.url)
            .setTimestamp();

          const Smessage = await interaction.reply({
            content: `預覽:`,
            embeds: [S_embed],
            components: [cancel_button, send_button],
            ephemeral: true,
          });
          const clr = Smessage.createMessageComponentCollector();

          clr.on("collect", async (ButtonInteraction) => {
            if (ButtonInteraction.customId == "send_button") {
              await sch.send({ embeds: [S_embed] });
              ButtonInteraction.update({
                content: "",
                embeds: [send_m],
                components: [],
              });
            }
          });
          clr.on("collect", async (ButtonInteraction) => {
            if (ButtonInteraction.customId == "cancel_button") {
              await ButtonInteraction.update({
                content: "",
                embeds: [cancel_m],
                components: [],
              });
            }
          });
        }
        break;
      case "other":
        {
          const O_embed = new EmbedBuilder()
            .setTitle("<:icons_box:869507189298040833> | 其他")
            .setColor("Purple")
            .setDescription(
              `提交者: ${interaction.user}  (伺服器: ${guild.name})`
            )
            .addFields({
              name: `提供的描述:`,
              value: `\`\`\`${description}\`\`\``,
              inline: true,
            })
            .setThumbnail(picture.url)
            .setTimestamp();

          const Omessage = await interaction.reply({
            content: `預覽:`,
            embeds: [O_embed],
            components: [cancel_button, send_button],
            ephemeral: true,
          });
          const clr = Omessage.createMessageComponentCollector();

          clr.on("collect", async (ButtonInteraction) => {
            if (ButtonInteraction.customId == "send_button") {
              await sch.send({ embeds: [O_embed] });
              ButtonInteraction.update({
                content: "",
                embeds: [send_m],
                components: [],
              });
            }
          });
          clr.on("collect", async (ButtonInteraction) => {
            if (ButtonInteraction.customId == "cancel_button") {
              await ButtonInteraction.update({
                content: "",
                embeds: [cancel_m],
                components: [],
              });
            }
          });
        }
        break;
    }
  },
};
