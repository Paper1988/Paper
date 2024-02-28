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
}

function addBadges(badgeNames) {
  if (!badgeNames.length) return ["<:xmark_988409378161954866:1201844342029815848>"];
  const badgeMap = {
    ActiveDeveloper: "<:activedeveloper:1201841218586152990>",
    BugHunterLevel1: "<:discordbughunter1:1201841226681438238>",
    BugHunterLevel2: "<:discordbughunter2:1201841229281898536>",
    PremiumEarlySupporter: "<:discordearlysupporter:1201841232125362196>",
    Partner: "<:discordpartner:1201841240371367936>",
    Staff: "<:discordstaff:1201841242431033394>",
    HypeSquadOnlineHouse1: "<:hypesquadbravery:1201841247875235920>", // bravery
    HypeSquadOnlineHouse2: "<:hypesquadbrilliance:1201841250987409408>", // brilliance
    HypeSquadOnlineHouse3: "<:hypesquadbalance:1201841246390468629>", // balance
    Hypesquad: "<:hypesquadevents:1201841254380601364>",
    CertifiedModerator: "<:discordmod:1201841233711079424>",
    VerifiedDeveloper: "<:discordbotdev:1201841223250223105>",
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
    await interaction.reply({ content: "<a:discord1792loading:1212016238839070791>載入中......", ephemeral: true });

    const member =
      interaction.options.getMember("member") || interaction.member;

    if (member.user.bot)
      return interaction.editReply({
        content: "",
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
        ? "<:discordboost7:1201841221899915325>"
        : "<:xmark_988409378161954866:1201844342029815848>";

      const Embed = new EmbedBuilder()
        .setAuthor({
          name: `${member.user.tag}`,
          iconURL: member.displayAvatarURL(),
        })
        .setColor(member.displayColor)
        .setDescription(
          `<:newmember_964425853410893874:1201843720799133718>在 <t:${joinTime}:D>，${member.user.username}成為${addSuffix(
            joinPosition
          )}加入這個伺服器的人`
        )
        .setImage("attachment://profile.png")
        .setThumbnail(member.displayAvatarURL({ size: 512 }))
        .addFields([
          {
            name: "<:award_869513411103424563:1201843623604527184>徽章",
            value: `${addBadges(userBadges).join("")}`,
            inline: true,
          },
          { name: "<:nitroboost_869528229436858378:1201843725446430791>加成", value: `${Booster}`, inline: true },
          {
            name: "<:owner_859429432380227594:1201843734917152858>最高權限的身分組",
            value: `${topRoles.join("").replace(`<@${interaction.guildId}>`)}`,
            inline: false,
          },
          { name: "<:clock_964491800465276940:1201843646203433030>帳號創建時間", value: `<t:${createdTime}:R>`, inline: true },
          { name: "<:clock_964491800465276940:1201843646203433030>帳號加入時間", value: `<t:${joinTime}:R>`, inline: true },
          { name: "<:id_860133546102620190:1201883864486916166>帳號ID", value: `\`${member.id}\``, inline: false },
          {
            name: "<:jpg_908958943726956564:1201843675530018856>橫幅",
            value: `[連結](${(await member.user.fetch()).bannerURL() || "無"})`,
            inline: true,
          },
        ]);

      return interaction.editReply({
        content: "",
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
