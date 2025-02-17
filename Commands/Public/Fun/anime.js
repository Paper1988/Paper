const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonStyle,
    ButtonBuilder,
    SlashCommandBuilder,
    ChatInputCommandInteraction
} = require('discord.js')
const mal = require('mal-scraper')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anime')
        .setNameLocalization('zh-TW', '動漫')
        .setNameLocalization('ja', 'アニメ')
        .setDescription('Search for anime information')
        .setDescriptionLocalization('zh-TW', '搜尋動漫資訊')
        .setDescriptionLocalization('ja', 'アニメ情報を検索')
        .addStringOption((option) =>
            option
                .setName('query')
                .setNameLocalization('zh-TW', '搜尋')
                .setNameLocalization('ja', '検索')
                .setDescription('Please enter the anime name')
                .setDescriptionLocalization('zh-TW', '請輸入動漫名稱')
                .setDescriptionLocalization('ja', 'アニメ名を入力してください')
                .setRequired(true)
        ),
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const search = interaction.options.getString('query')
        await interaction.deferReply()
        await mal.getInfoFromName(search).then(async (data) => {
            const embed = new EmbedBuilder()
                .setAuthor({ name: `動漫搜尋結果: ${search}` })
                .setImage(data.picture)
                .setColor('#5865F2')
                .addFields(
                    { name: '英文標題', value: `${data.englishTitle || '無!'}` },
                    { name: '日文標題', value: `${data.japaneseTitle || '無!'}` },
                    { name: '類型', value: `${data.type || '無!'}` },
                    { name: '集數', value: `${data.episodes || '無!'}` },
                    { name: '分數', value: `${data.score || '無!'}` },
                    { name: '分級', value: `${data.rating || '無!'}` },
                    { name: '上映', value: `${data.aired || '無!'}` }
                )
                .setFooter({
                    text: `由 ${interaction.user.username} 查詢`,
                    iconURL: interaction.user.displayAvatarURL({
                        dynamic: true,
                        format: 'png',
                        size: 2048
                    })
                })
                .setTimestamp()
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setStyle(ButtonStyle.Link).setURL(data.url).setLabel('查看更多')
            )
            await interaction.followUp({ embeds: [embed], components: [row] })
        })
    }
}
