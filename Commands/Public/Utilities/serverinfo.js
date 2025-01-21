const { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setNameLocalization('zh-TW', '伺服器資訊')
        .setNameLocalization('ja', 'サーバー情報')
        .setDescription('Get information about the server')
        .setDescriptionLocalization('zh-TW', '取得伺服器資訊')
        .setDescriptionLocalization('ja', 'サーバー情報を取得します'),
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    execute(interaction) {
        const { guild } = interaction

        const {
            createdTimestamp,
            ownerId,
            description,
            members,
            memberCount,
            emojis,
            stickers,
            channels
        } = guild

        const Embed = new EmbedBuilder()
            .setColor('Purple')
            .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL()
            })
            .setImage(guild.bannerURL({ size: 1024 }))
            .setThumbnail(guild.iconURL())
            .addFields(
                {
                    name: '<:generalinfo:1265560439002234986> | 一般資訊',
                    value: `
					<:edit:1265560348392685648>伺服器名稱: **${guild.name}**
					<:clock:1265560238137016372>創建時間: <t:${parseInt(createdTimestamp / 1000)}:R>
					<:owner:1265561364693258383>擁有者: <@${ownerId}>

					<:quote:1265561651890094112>伺服器敘述: ${description || '<:xmark:1265562550947545089>'}
					`
                },
                {
                    name: '<:people:1265561435220611196> | 用戶統計',
                    value: `
					<:people:1265561435220611196>成員數量: \`${members.cache.filter((m) => !m.user.bot).size}\`
					<:bot:1265560174215827527>機器人: \`${members.cache.filter((m) => m.user.bot).size}\`
					共計: \`${memberCount}\`
					`
                },
                {
                    name: '<:channel:1265560212824260609> | 頻道統計',
                    value: `
          <:links:1265560833619001345>類別: \`${channels.cache.filter((c) => c.type === 4).toJSON().length}\`
					<:channel:1265560212824260609>文字: \`${channels.cache.filter((c) => c.type === 0).toJSON().length}\`
					<:speaker:1265561928533807146>語音: \`${channels.cache.filter((c) => c.type === 2).toJSON().length}\`
					<:thread:1265562376795586611>討論串: \`${
                        channels.cache.filter((c) => c.type === 10 && 11 && 12).toJSON().length
                    }\`
          <:forum:1265560396933234729>論壇: \`${channels.cache.filter((c) => c.type === 15).toJSON().length}\`
					<:stage:1265562066060578929>舞台: \`${channels.cache.filter((c) => c.type === 13).size}\`
					共計: \`${channels.cache.size}\`
					`
                },
                {
                    name: '<:addreaction:1265557152953798747> | 表情符號 & 貼圖統計',
                    value: `
					<:gif:1265560455552831560>GIF貼圖: \`${emojis.cache.filter((e) => e.animated).size}\`
					<:image:1265560565108179035>一般貼圖: \`${emojis.cache.filter((e) => !e.animated).size}\`
					<:sticker:1265562184541278270>貼圖: \`${stickers.cache.size}\`
					共計: \`${stickers.cache.size + emojis.cache.size}\`
					`
                },
                {
                    name: '<:star:1265562160512372858> | NITRO 統計',
                    value: `
          <:role:1265561763529887804>身分組: \`${guild.roles.cache.size}\`
					<:nitroboost:1265561191103856661>加成等級: \`${guild.premiumTier}\`
					<:nitro:1265561159436865749>加成次數: \`${guild.premiumSubscriptionCount}\`
					<:discordnitro:1265560300757717023>加成者數量: \`${members.cache.filter((m) => m.premiumSince).size}\`
					`
                }
            )
            .setTimestamp()

        interaction.reply({ embeds: [Embed] })
    }
}
