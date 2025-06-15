import type { CommandType } from '@/typings/command'
import translate from '@iamtraction/google-translate'
import {
    ApplicationCommandType,
    Client,
    ContextMenuCommandBuilder,
    ContextMenuCommandInteraction,
    EmbedBuilder,
    MessageFlags
} from 'discord.js'

export default {
    data: new ContextMenuCommandBuilder()
        .setName('translate')
        .setNameLocalization('zh-TW', '翻譯')
        .setNameLocalization('ja', '翻訳する')
        .setType(ApplicationCommandType.Message)
        .setContexts(0, 1, 2)
        .setIntegrationTypes(0, 1),
    async execute(interaction: ContextMenuCommandInteraction, client: Client) {
        // 取得被選取的訊息內容
        const targetMessage = await interaction.channel?.messages.fetch(interaction.targetId)
        const text = targetMessage?.content

        if (!text) {
            return interaction.reply({
                content: '<:warning:1265562532857380936> | 無法翻譯空白訊息!',
                flags: MessageFlags.Ephemeral
            })
        }

        await interaction.reply({
            content: '<a:discord_loading:1342772648282689546> | 正在翻譯你的訊息至**繁體中文**...',
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
            .catch((err) => {
                interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(
                                `<:warning:1265562532857380936> | 發生錯誤: \`${err.message}\``
                            )
                            .setFooter({ text: `請協助回報!` })
                    ]
                })
            })
    }
} as CommandType
