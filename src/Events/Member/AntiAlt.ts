import { EmbedBuilder, GuildMember, TextChannel, Webhook } from 'discord.js'
import ms from 'ms'
import DB from '../../Structures/Schemas/AntiAlt'

export default {
    name: 'guildMemberAdd',
    /**
     * @param {GuildMember} member
     */
    async execute(member: GuildMember) {
        const Data = await DB.findOne({
            GuildID: member.guild.id
        })
            .exec()
            .catch(() => {})
        if (!Data) return

        const logChannel = member.guild.channels.cache.get(Data.LogsChannel!)

        const minAge = ms('7 days')
        const createdAt = new Date(member.user.createdAt).getTime()
        const diff = Date.now() - createdAt

        if (minAge > diff) {
            await member.kick()

            const logEmbed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('發現小號!')
                .setDescription(
                    '<:outage:1265561329528471613> | 該用戶因帳號年齡未滿 `7` 天而被踢出'
                )
                .addFields(
                    {
                        name: '用戶名稱',
                        value: `${member.user.tag}`,
                        inline: true
                    },
                    {
                        name: 'ID',
                        value: `${member.user.id}`,
                        inline: true
                    },
                    {
                        name: '帳號創立時間',
                        value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
                        inline: true
                    }
                )
                .setTimestamp()

            return await createAndDeleteWebhook(logEmbed) // Send the logs to the logs channel
        }

        async function createAndDeleteWebhook(embedName: EmbedBuilder) {
            await (logChannel! as TextChannel)
                .createWebhook({
                    // Creates a webhook in the logging channel specified before
                    name: member.guild.name,
                    avatar: member.guild.iconURL(),
                    reason: '自動踢出小號系統'
                })
                .then((webhook: Webhook) => {
                    webhook
                        .send({
                            embeds: [embedName]
                        })
                        .then(() => webhook.delete().catch(() => {}))
                })
        }
    }
}
