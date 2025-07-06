import translate from '@iamtraction/google-translate'
import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    MessageFlags,
    SlashCommandBuilder
} from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('translate')
        .setNameLocalization('zh-TW', '翻譯')
        .setNameLocalization('ja', '翻訳する')
        .setDescription('Translate any text into any language you want')
        .setDescriptionLocalization('zh-TW', '將任何文字翻譯成你想要的任何語言')
        .setDescriptionLocalization('ja', '任意のテキストを任意の言語に翻訳します')
        .addStringOption((option) =>
            option
                .setName('language')
                .setNameLocalization('zh-TW', '語言')
                .setNameLocalization('ja', '言語')
                .setDescription('The language you want to translate to')
                .setDescriptionLocalization('zh-TW', '你想要翻成的語言')
                .setDescriptionLocalization('ja', '翻訳したい言語')
                .addChoices(
                    { name: 'العربية(阿拉伯文)', value: 'ar' },
                    { name: 'Nederlands(荷蘭文)', value: 'nl' },
                    { name: 'English(英文)', value: 'en' },
                    { name: 'Français(法文)', value: 'fr' },
                    { name: 'Ελληνικά(希臘文)', value: 'gl' },
                    { name: 'Deutsch(德文)', value: 'de' },
                    { name: 'Italiano(義大利文)', value: 'it' },
                    { name: '日本語(日文)', value: 'ja' },
                    { name: 'Lingua Latīna(拉丁文)', value: 'la' },
                    { name: 'Português(葡萄牙文)', value: 'pt' },
                    { name: 'Русский(俄羅斯文)', value: 'ru' },
                    { name: 'Español(西班牙文)', value: 'es' },
                    { name: '中文(繁體)', value: 'zh-tw' },
                    { name: '中文(簡體)', value: 'zh-cn' }
                )
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('message')
                .setNameLocalization('zh-TW', '訊息')
                .setNameLocalization('ja', 'メッセージ')
                .setDescription('The message you want to translate')
                .setDescriptionLocalization('zh-TW', '要翻譯的訊息')
                .setDescriptionLocalization('ja', '翻訳するテキスト')
                .setRequired(true)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const langName = interaction.options.getString('language')
        const text = interaction.options.getString('message')

        await interaction.reply({
            content: '<a:discord_loading:1342772648282689546> | 正在翻譯你的訊息...',
            flags: MessageFlags.Ephemeral
        })

        await translate(text!, { to: `${langName}` })
            .then((res) => {
                const trans =
                    res.from.text.didYouMean || res.from.text.autoCorrected
                        ? res.from.text.value
                        : res.text

                const successEmbed = new EmbedBuilder()
                    .setTitle('<:translate:1265562430902243410> | 成功翻譯訊息')
                    .setColor('Green')
                    .setTimestamp()
                    .addFields(
                        { name: '翻譯前: ', value: `\`\`\`${text}\`\`\``, inline: false },
                        {
                            name: '翻譯後: ',
                            value: `\`\`\`${trans}\`\`\``,
                            inline: false
                        },
                        { name: '語言: ', value: `${langName}`, inline: false }
                    )
                interaction.editReply({
                    content: '',
                    embeds: [successEmbed]
                })
            })
            .catch((err) => {
                interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(
                                `<:warning:1265562532857380936> | 發生錯誤: \`${err.message}\``
                            )
                            .setFooter({ text: '請協助回報!' })
                    ]
                })
            })
    }
}
