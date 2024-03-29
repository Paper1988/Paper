const {
    SlashCommandBuilder,
    EmbedBuilder,
    ChatInputCommandInteraction,
    Client
} = require('discord.js')

const axios = require('axios')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('virus-check')
        .setDescription('檢查連結是否有病毒')
        .addStringOption((option) => {
            option.setName('url').setDescription('請提供連結').setRequired(true)
        }),
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const { options } = interaction
        const url = options.getString('url')

        await interaction.deferReply({ ephemeral: true })

        async function sendMessage(message) {
            const embed = new EmbedBuilder().setColor('Blurple').setDescription(message)

            await interaction.editReply({ embeds: [embed] })
        }

        async function checkUrl(url) {
            try {
                const urlToCheck = encodeURI(url)
                const apiUrl = `https://ww.virustotal.com/vtapi/v2/url/report?apikey=${client.config.virusAPIKey}&resource=${urlToCheck}`

                const response = await axios.get(apiUrl)
                const data = response.data
                if (data.verbose_msg == 'Resource does not exist in the dataset')
                    return '<:warning_908958943466893323:1201844340276862976> | 請提供有效的連結!(或我找不到該連結)'

                const scanDate = new Date(data.scan_date)
                const formattedScanDate = `<t:${Math.floor(scanDate.getTime() / 1000)}:R>`

                var results = ``
                if (data.positives > 0)
                    results = `> <:exclamation_859388127885131796:1222867026805260380> | **發現病毒連結!!**你可以使用下面的網站來了解更資訊`
                else
                    results = `> <:correct_859388130411282442:1201843648229294121> | 這個網站很安全，請放心使用!`

                const dataObj = {
                    url: `> <:link_859388126875484180:1222887338263314492> 連結: \`${url}\``,
                    scanData: `> <:calendar_941679946760351794:1222888285806792704> 查詢日期: ${formattedScanDate}`,
                    positives: `> \`${data.positives}/${data.total}\``,
                    results: results,
                    full: `> 點[我](${data.permalink}) 來了解更多資訊`
                }

                return `<:search_859424401723883560:1201844291098382457> | **你的查詢結果：** \n\n${Object.values(dataObj).join('\n')}\n\n**請注意: 上述提到的*查詢日期*並非你運行這個指令的日期，而是API最近確認這個網站的時間**`
            } catch (err) {
                return '<:warning_908958943466893323:1201844340276862976> | 發生錯誤，請協助回報!'
            }
        }

        var output = await checkUrl(url)
        await sendMessage(output)
    }
}
