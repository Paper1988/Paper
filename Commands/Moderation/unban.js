const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder,
  ChatInputCommandInteraction,
  Client,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("解除封鎖伺服器中被封鎖的成員")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),
  /**
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(client, interaction) {
    const { guild } = interaction;
    var members;

    const fetchBan = await guild.bans.fetch({ limit: 25 });

    const noBanEmbed = new EmbedBuilder()
      .setColor("Blue")
      .setDescription(`<:warning_908958943466893323:1201844340276862976> | 伺服器中沒有正被封鎖的用戶!`)
      .setFooter({
        text: client.user.username,
        iconURL: client.user.displayAvatarURL(),
      });

    if (fetchBan.size == 0)
      return interaction.reply({
        embeds: [noBanEmbed],
        ephemeral: true,
      });

    const memberList = [];
    fetchBan.forEach((member) => {
      memberList.push({ label: member.user.username, value: member.user.id });
    });

    const choicesEmbed = new EmbedBuilder()
      .setColor('Blue')
      .setDescription("從下面的列表中選取一位用戶")
      .setFooter({
        text: client.user.username,
        iconURL: client.user.displayAvatarURL({ dynamic: true }),
      });

    const selectMenu = new ActionRowBuilder().addComponents([
      new StringSelectMenuBuilder()
        .setCustomId("unban:selectMenu")
        .setPlaceholder("選擇一個用戶")
        .addOptions(memberList)
        .setMinValues(1)
        .setMaxValues(1),
    ]);

    interaction.reply({
        embeds: [choicesEmbed],
        components: [selectMenu],
        ephemeral: true,
      })
      .then(async (msg) => {
        const collector = msg.createMessageComponentCollector({
          idle: 10000,
        });

        collector.on("collect", async (i) => {
          if (i.isStringSelectMenu() && i.customId == "unban:selectMenu") {
            members = await client.users.fetch(i.values[0]);

            const confirmationEmbed = new EmbedBuilder()
              .setColor("Blue")
              .setDescription(
                `<:question_860133545905225768:1202218555844853760> | 你確定要解除封鎖 ${members} 嗎?`,
              )
              .setFooter({
                text: client.user.username,
                iconURL: client.user.displayAvatarURL(),
              });

            const buttons = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId("unban:confirm")
                .setLabel("<:correct_859388130411282442:1201843648229294121>確認")
                .setStyle("Danger"),
              new ButtonBuilder()
                .setCustomId("unban:cancel")
                .setLabel("<:xmark_988409378161954866:1201844342029815848>取消")
                .setStyle("Secondary"),
            );

            await i.update({
              embeds: [confirmationEmbed],
              components: [buttons],
            });
          } else if (i.isButton() && i.customId == "unban:confirm") {
            const processEmbed = new EmbedBuilder()
              .setColor("Blue")
              .setDescription(`<:loading_859424401036148776:1201884046993661972> | 正在執行中...`)
              .setFooter({
                text: client.user.username,
                iconURL: client.user.displayAvatarURL(),
              });

            await i.update({
              embeds: [processEmbed],
              components: [],
            });

            await guild.members.unban(members.id);

            const finishedEmbed = new EmbedBuilder()
              .setColor("Blue")
              .setDescription(`${members} 已被解除封鎖!`)
              .setFooter({
                text: "你可以關閉這個視窗了",
              });

            msg.edit({
              embeds: [finishedEmbed],
              components: [],
            });
          } else if (i.isButton() && i.customId == "unban:cancel") {
            const canceledEmbed = new EmbedBuilder()
              .setColor("Blue")
              .setDescription(`<:outage_868122243845206087:1202112862990897172> | 動作已取消`)
              .setFooter({
                text: "你可以關閉這個視窗了",
              });

            i.update({
              embeds: [canceledEmbed],
              components: [],
            });
          }
        });

        collector.on("end", async () => {
          const msgC = await interaction.fetchReply();
          if (!msg) return;
          if (!msgC.components.length) return;

          const noInteractionEmbed = new EmbedBuilder()
            .setColor("Orange")
            .setDescription(
              `10秒內未收到任何回應，動作已取消!`,
            )
            .setFooter({
              text: "你可以關閉這個視窗了",
            });

          msg.edit({
            embeds: [noInteractionEmbed],
            components: [],
          });
        });
      });
  }
};