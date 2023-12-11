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
        embeds: [
          new EmbedBuilder().setDescription("> 目前尚未支援機器人使用此功能!"),
        ],
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
        : "✖";

      const Embed = new EmbedBuilder()
        .setAuthor({
          name: `${member.user.tag} | 一般資訊 `,
          iconURL: member.displayAvatarURL(),
        })
        .setColor(member.displayColor)
        .setDescription(
          `在 <t:${joinTime}:D> ， ${member.user.username} 以 ${addSuffix(
            joinPosition
          )} 成員的身分，加入了這個伺服器`
        )
        .setImage("attachment://profile.png")
        .addFields([
          {
            name: "徽章",
            value: `${addBadges(userBadges).join("")}`,
            inline: true,
          },
          { name: "加成", value: `${Booster}`, inline: true },
          {
            name: "最高權限的身分組",
            value: `${topRoles.join("").replace(`<@${interaction.guildId}>`)}`,
            inline: false,
          },
          { name: "帳號創建時間", value: `<t:${createdTime}:R>`, inline: true },
          { name: "帳號加入時間", value: `<t:${joinTime}:R>`, inline: true },
          { name: "帳號ID", value: `${member.id}`, inline: false },
          {
            name: "頭像",
            value: `[連結](${member.displayAvatarURL()})`,
            inline: true,
          },
          {
            name: "橫幅",
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
      interaction.editReply({ content: "> 發生錯誤，請協助回報錯誤!" });
      throw err;
    }
  },
};
