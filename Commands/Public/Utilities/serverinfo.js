const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("伺服器資訊"),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  execute(interaction) {
    const { guild } = interaction;

    const {
      createdTimestamp,
      ownerId,
      description,
      members,
      memberCount,
      emojis,
      stickers,
      channels,
    } = guild;

    const Embed = new EmbedBuilder()
      .setColor("Purple")
      .setAuthor({
        name: guild.name,
        iconURL: guild.iconURL({ dynamic: true }),
      })
      .setImage(guild.bannerURL({ dynamic: true, size: 1024 }))
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        {
          name: "<:icons_generalinfo:866599434098835486> | 一般資訊",
          value: `
					<:icons_edit:859388129625374720>伺服器名稱: **${guild.name}**
					<:icons_reminder:859388128364199946>創建時間: <t:${parseInt(createdTimestamp / 1000)}:R>
					<:icons_owner:859429432380227594>擁有者: <@${ownerId}>

					<:icons_quotes:860123643887091723>伺服器敘述: ${description || "<:icons_xmarkwhite:988409378161954866>"}
					`,
        },
        {
          name: "<:icons_people:964425853930995783> | 用戶統計",
          value: `
					<:icons_defaultperms:866943907698180137>成員數量: \`${members.cache.filter((m) => !m.user.bot).size}\`
					<:icons_bots:865488228789649429>機器人: \`${members.cache.filter((m) => m.user.bot).size}\`
					共計: \`${memberCount}\`
					`,
        },
        {
          name: "<:icons_channel:859424401950113822> | 頻道統計",
          value: `
					<:icons_channel:859424401950113822>文字: \`${channels.cache.filter((c) => c.type === 0).toJSON().length}\`
					<:icons_speaker:860133545544908802>語音: \`${channels.cache.filter((c) => c.type === 2).toJSON().length}\`
					<:icons_threadchannel:866694823972438056>討論串: \`${
            channels.cache.filter(
              (c) =>
                c.type === 10 &&
                11 &&
                12
            ).toJSON().length
          }\`
          <:icons_forum:964425853138264094>論壇: \`${channels.cache.filter((c) => c.type === 15).toJSON().length}\`
					<:icons_linked:875395222962585660>類別: \`${channels.cache.filter((c) => c.type === 4).toJSON().length}\`
					<:icons_podcast:859424401304846366>舞台: \`${channels.cache.filter((c) => c.type === 13).size}\`
					共計: \`${channels.cache.size}\`
					`,
        },
        {
          name: "<:icons_addreactions:866920224581746698> | 表情符號 & 貼圖統計",
          value: `
					<:icons_gif:861124851531644939>GIF貼圖: \`${emojis.cache.filter((e) => e.animated).size}\`
					<:icons_image:861124851828523038>一般貼圖: \`${emojis.cache.filter((e) => !e.animated).size}\`
					<:icons_stickers:861124851435831317>貼圖: \`${stickers.cache.size}\`
					共計: \`${stickers.cache.size + emojis.cache.size}\`
					`,
        },
        {
          name: "<:icons_star:859388127880544296> | NITRO 統計",
          value: `
          <:icons_roles:866605189029298197>身分組: \`${guild.roles.cache.size}\`
					<:icons_colorboostnitro:869528229436858378>加成等級: \`${guild.premiumTier}\`
					<:icons_colornitro:869528229193584650>加成次數: \`${guild.premiumSubscriptionCount}\`
					<:icons_discordnitro:861852633592758302>加成者數量: \`${members.cache.filter((m) => m.premiumSince).size}\`
					`,
        }
      )
      .setTimestamp();

    interaction.reply({ embeds: [Embed] });
  },
};
