import { ButtonInteraction, Client, EmbedBuilder } from 'discord.js'
import BugReportDB from '../../Structures/Schemas/Report'

export default {
    id: 'feedback-fixed',
    async execute(interaction: ButtonInteraction, client: Client) {
        const [_, userId] = interaction.customId.split(':')

        const Report = await BugReportDB.findOne({ userId })
        if (!Report) return

        const fixed = new EmbedBuilder()
            .setTitle('Bug已解決')
            .setDescription(
                `<:exclamation:1265560367040299159> | 正如標題所述，你在 \`${Report?.createdAt?.toLocaleString('zh-Hant-TW')}\` 回報的Bug已經被開發人員修復，再次感謝你的回報！\n-# 如果還有問題，歡迎隨時回報`
            )
            .setColor('Blurple')
            .setFooter({
                text: `${client.user!.username}`,
                iconURL: client.user!.avatarURL()!
            })
            .setTimestamp()

        const user = client.users.cache.get(userId!)

        if (user) {
            await user
                .send({
                    embeds: [fixed]
                })
                .catch(() => {
                    console.log('User has DMs disabled')
                })
        } else {
            console.log('User has DMs disabled')
        }

        const e = interaction.message.embeds[0]!

        const embed = new EmbedBuilder()
            .setAuthor(e.author)
            .setTitle(e.title)
            .setDescription(e.description)
            .setColor('#64ff33')
            .setFields(e.fields)
            .setFooter(e.footer)
            .setThumbnail(e.thumbnail?.url ?? null)
            .setImage(e.image?.url ?? null)
            .setURL(e.url)

        await interaction.update({
            content: '',
            embeds: [embed],
            components: []
        })

        await Report?.deleteOne({ userId }).exec()
    }
}
