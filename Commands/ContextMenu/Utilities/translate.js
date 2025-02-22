const {
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    EmbedBuilder,
    ContextMenuCommandInteraction,
    MessageFlags
} = require('discord.js')
const translate = require(`@iamtraction/google-translate`)

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('translate')
        .setNameLocalization('zh-TW', '翻譯')
        .setNameLocalization('ja', '翻訳')
        .setType(ApplicationCommandType.Message)
        .setContexts(0, 1, 2)
        .setIntegrationTypes(0, 1),
    /**
     * @param {ContextMenuCommandInteraction} interaction
     */
    async execute(interaction) {
        // 獲取被選取的訊息內容
        const targetMessage = interaction.targetMessage
        const text = targetMessage.content

        // 如果訊息是空的
        if (!text) {
            return interaction.reply({
                content: '<:warning:1265562532857380936> | 無法翻譯空白訊息!',
                flags: MessageFlags.Ephemeral
            })
        }

        await interaction.reply({
            content:
                '<a:discord1792loading:1212016238839070791> | 正在翻譯你的訊息至**繁體中文**...',
            flags: MessageFlags.Ephemeral
        })

        await translate(text, { to: `zh-tw` })
            .then(async (res) => {
                let trans =
                    res.from.text.didYouMean || res.from.text.autoCorrected
                        ? res.from.text.value
                        : res.text

                // 獲取原始語言名稱
                const langName = `${res.from.language.iso} → zh-tw`

                const successEmbed = new EmbedBuilder()
                    .setTitle(`<:translate:1265562430902243410> | 成功翻譯訊息`)
                    .setColor(`Green`)
                    .setTimestamp()
                    .addFields(
                        { name: `翻譯前: `, value: `\`\`\`${text}\`\`\``, inline: false },
                        {
                            name: `翻譯後: `,
                            value: `\`\`\`${trans}\`\`\``,
                            inline: false
                        },
                        { name: `語言: `, value: `${langName}`, inline: false }
                    )
                await interaction.editReply({
                    content: '',
                    embeds: [successEmbed]
                })
            })
            .catch(async (err) => {
                await interaction.editReply({
                    content: `<:warning:1265562532857380936> | 發生錯誤: \`${err.message}\`\n-# 請協助回報!`,
                    flags: MessageFlags.Ephemeral
                })
            })
    }
}
