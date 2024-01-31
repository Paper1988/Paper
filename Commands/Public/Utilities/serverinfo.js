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
          name: "<:generalinfo_866599434098835486:1201843655393157152> | 一般資訊",
          value: `
					<:edit_859388129625374720:1202224948752424970>伺服器名稱: **${guild.name}**
					<:clock_964491800465276940:1201843646203433030>創建時間: <t:${parseInt(createdTimestamp / 1000)}:R>
					<:owner_859429432380227594:1201843734917152858>擁有者: <@${ownerId}>

					<:quote_860123643887091723:1201844277865357312>伺服器敘述: ${description || "<:xmark_988409378161954866:1201844342029815848>"}
					`,
        },
        {
          name: "<:people_964425853930995783:1201843743762681906> | 用戶統計",
          value: `
					<:people_964425853930995783:1201843743762681906>成員數量: \`${members.cache.filter((m) => !m.user.bot).size}\`
					<:bot_865488228789649429:1201843632940777602>機器人: \`${members.cache.filter((m) => m.user.bot).size}\`
					共計: \`${memberCount}\`
					`,
        },
        {
          name: "<:channel_859424401950113822:1201843641124147280> | 頻道統計",
          value: `
					<:channel_859424401950113822:1201843641124147280>文字: \`${channels.cache.filter((c) => c.type === 0).toJSON().length}\`
					<:speaker_860133545544908802:1201844300099354644>語音: \`${channels.cache.filter((c) => c.type === 2).toJSON().length}\`
					<:thread_866694823972438056:1201844322476228638>討論串: \`${
            channels.cache.filter(
              (c) =>
                c.type === 10 &&
                11 &&
                12
            ).toJSON().length
          }\`
          <:forum_964425853138264094:1202224009803202660>論壇: \`${channels.cache.filter((c) => c.type === 15).toJSON().length}\`
					<:links_875395222962585660:1201843688410726400>類別: \`${channels.cache.filter((c) => c.type === 4).toJSON().length}\`
					<:stage_859424401304846366:1201844310707011614>舞台: \`${channels.cache.filter((c) => c.type === 13).size}\`
					共計: \`${channels.cache.size}\`
					`,
        },
        {
          name: "<:addreaction_866920224581746698:1201843621398323250> | 表情符號 & 貼圖統計",
          value: `
					<:gif_861124851531644939:1202225559451475971>GIF貼圖: \`${emojis.cache.filter((e) => e.animated).size}\`
					<:image_861124851828523038:1202226276052762634>一般貼圖: \`${emojis.cache.filter((e) => !e.animated).size}\`
					<:sticker_861124851435831317:1201844313118474291>貼圖: \`${stickers.cache.size}\`
					共計: \`${stickers.cache.size + emojis.cache.size}\`
					`,
        },
        {
          name: "<:star_859388127880544296:1202227494762319972> | NITRO 統計",
          value: `
          <:role_866605189029298197:1201844287923290172>身分組: \`${guild.roles.cache.size}\`
					<:nitroboost_869528229436858378:1201843725446430791>加成等級: \`${guild.premiumTier}\`
					<:nitro_869528229193584650:1201884116833009664>加成次數: \`${guild.premiumSubscriptionCount}\`
					<:discordnitro_861852633592758302:1202226274471526460>加成者數量: \`${members.cache.filter((m) => m.premiumSince).size}\`
					`,
        }
      )
      .setTimestamp();

    interaction.reply({ embeds: [Embed] });
  },
};
