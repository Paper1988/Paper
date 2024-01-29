const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder,
  ChatInputCommandInteraction,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("解除封鎖一名成員")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(client, interaction) {
    const { guild } = interaction;
    var members;

    const fetchBan = await guild.bans.fetch({ limit: 25 });

    const noBanEmbed = new EmbedBuilder()
      .setColor("Blue")
      .setDescription(`<:icons_warning:908958943466893323> | 伺服器中沒有正被封鎖的用戶!`)
      .setFooter({
        text: client.user.username,
        iconURL: client.user.displayAvatarURL({ dynamic: true }),
      });

    if (fetchBan.size == 0)
      return interaction.reply({
        embeds: [noBanEmbed],
        components: [],
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

    const selectMenu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("unban:selectMenu")
        .setPlaceholder("選擇一個用戶")
        .addOptions(memberList)
        .setMinValues(1)
        .setMaxValues(1),
    );

    interaction
      .reply({
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
                `<:icons_question:860133545905225768>你確定要解除封鎖 ${members} 嗎?`,
              )
              .setFooter({
                text: client.user.username,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
              });

            const buttons = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId("unban:confirm")
                .setLabel("<:icons_Correct:859388130411282442>確認")
                .setStyle("Danger"),
              new ButtonBuilder()
                .setCustomId("unban:cancel")
                .setLabel("<:icons_xmarkwhite:988409378161954866>取消")
                .setStyle("Secondary"),
            );

            await i.update({
              embeds: [confirmationEmbed],
              components: [buttons],
            });
          } else if (i.isButton() && i.customId == "unban:confirm") {
            const processEmbed = new EmbedBuilder()
              .setColor("Blue")
              .setDescription(`<:icons_loading:859424401036148776>正在執行中...`)
              .setFooter({
                text: client.user.username,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
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
              .setDescription(`<:icons_outage:868122243845206087>動作已取消`)
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