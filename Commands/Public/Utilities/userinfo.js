const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  AttachmentBuilder,
} = require("discord.js");

const { profileImage } = require("discord-arts");

function addSuffix(number) {
  if (number % 100 >= 11 && number % 100 <= 13) return "第" + number + "位";

  switch (number % 10) {
    case 1:
      return "第" + number + "位";
    case 2:
      return "第" + number + "位";
    case 3:
      return "第" + number + "位";
  }
  return number + "th";
}

function addBadges(badgeNames) {
  if (!badgeNames.length) return ["X"];
  const badgeMap = {
    ActiveDeveloper: "<:activedeveloper:1094238741528322068>",
    BugHunterLevel1: "<:discordbughunter1:1094238759618351184>",
    BugHunterLevel2: "<:discordbughunter2:1094238764420833290>",
    PremiumEarlySupporter: "<:discordearlysupporter:1094238768564797550>",
    Partner: "<:discordpartner:1094238782879961088>",
    Staff: "<:discordstaff:1094238787057504256>",
    HypeSquadOnlineHouse1: "<:hypesquadbravery:1094238795769065583>", // bravery
    HypeSquadOnlineHouse2: "<:hypesquadbrilliance:1094238801792073758>", // brilliance
    HypeSquadOnlineHouse3: "<:hypesquadbalance:1094238792535261225>", // balance
    Hypesquad: "<:hypesquadevents:1094238809635434626>",
    CertifiedModerator: "<:discordmod:1094238772423565384>",
    VerifiedDeveloper: "<:discordbotdev:1094238757277925488>",
  };

  return badgeNames.map((badgeName) => badgeMap[badgeName] || "❔");
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("取得指定用戶的資訊")
    .addUserOption((option) =>
      option.setName("member").setDescription("選擇一個用戶").setRequired(false)
    )
    .setDMPermission(false),
  usage: "/userinfo {user}",
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.deferReply();

    const member =
      interaction.options.getMember("member") || interaction.member;

    if (member.user.bot)
      return interaction.editReply({
        embeds: [new EmbedBuilder().setDescription("<:warning_908958943466893323:1201844340276862976> | 機器人無法使用此功能!")],
        ephemeral: true,
      });

    try {
      const fetchedMembers = await interaction.guild.members.fetch();
      const profileBuffer = await profileImage(member.id);

      const imageAttachment = new AttachmentBuilder(profileBuffer, {
        name: "profile.png",
      });

      const joinPosition =
        Array.from(
          fetchedMembers
            .sort((a, b) => a.joinedTimestamp - b.joinedTimestamp)
            .keys()
        ).indexOf(member.id) + 1;

      const topRoles = member.roles.cache
        .sort((a, b) => b.position - a.position)
        .map((role) => role)
        .slice(0, 3);

      const userBadges = member.user.flags.toArray();

      const joinTime = parseInt(member.joinedTimestamp / 1000);
      const createdTime = parseInt(member.user.createdTimestamp / 1000);

      const Booster = member.premiumSince
        ? "<:discordboost7:1094238751229739119>"
        : "<:xmark_988409378161954866:1201844342029815848>";

      const Embed = new EmbedBuilder()
        .setAuthor({
          name: `<:icons_richpresence:860133546173923388> | ${member.user.tag}`,
          iconURL: member.displayAvatarURL(),
        })
        .setColor(member.displayColor)
        .setDescription(
          `<:icons_newmembers:964425853410893874>在 <t:${joinTime}:D>，${member.user.username}成為${addSuffix(
            joinPosition
          )}成員加入這個伺服器的人`
        )
        .setImage("attachment://profile.png")
        .setThumbnail(member.displayAvatarURL({ dynamic: true, size: 512 }))
        .addFields([
          {
            name: "<:icons_award:869513411103424563>徽章",
            value: `${addBadges(userBadges).join("")}`,
            inline: true,
          },
          { name: "<:icons_colorboostnitro:869528229436858378>加成", value: `${Booster}`, inline: true },
          {
            name: "<:owner_859429432380227594:1201843734917152858>最高權限的身分組",
            value: `${topRoles.join("").replace(`<@${interaction.guildId}>`)}`,
            inline: false,
          },
          { name: "<:icons_reminder:859388128364199946>帳號創建時間", value: `<t:${createdTime}:R>`, inline: true },
          { name: "<:icons_reminder:859388128364199946>帳號加入時間", value: `<t:${joinTime}:R>`, inline: true },
          { name: "<:id_860133546102620190:1201883864486916166>帳號ID", value: `${member.id}`, inline: false },
          {
            name: "<:icons_jpg:908958943726956564>橫幅",
            value: `[連結](${(await member.user.fetch()).bannerURL() || "無"})`,
            inline: true,
          },
        ]);

      interaction.editReply({
        embeds: [Embed],
        ephemeral: true,
        files: [imageAttachment],
      });
    } catch (err) {
      interaction.editReply({ content: "<:warning_908958943466893323:1201844340276862976> | 發生錯誤，請協助回報!" });
      throw err;
    }
  },
};
