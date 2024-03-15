const { EmbedBuilder, GuildMember } = require('discord.js')
const ms = require('ms')
const DB = require('../../Structures/Schemas/AntiAlt') // Change this to your own DB

module.exports = {
    name: 'guildMemberAdd', // This is the name of the Event
    /**
     * @param {GuildMember} member
     */
    async execute(member) {
        const Data = await DB.findOne({
            // Checking for data in the DB
            GuildID: member.guild.id
        })
        if (!Data) return // If there is no data, we stop the event from running

        const logChannel = member.guild.channels.cache.get(Data.LogsChannel) // Get the logs channel

        let minAge = ms('7 days') // Set the minimum age to 7 days
        let createdAt = new Date(member.user.createdAt).getTime() // Get the user's createdAt date
        let diff = Date.now() - createdAt // Get the difference between the current date and the user's createdAt date

        if (minAge > diff) {
            // If the difference is less than the minimum age
            await member.kick() // Kick the user

            const logEmbed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('發現小號!')
                .setDescription(
                    `<:outage_868122243845206087:1202112862990897172> | 該用戶因帳號年齡未滿 \`7\` 天而被踢出`
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
                        value: `<t:${parseInt(member.user.createdTimestamp / 1000)}:R>`,
                        inline: true
                    }
                )
                .setTimestamp()

            return await createAndDeleteWebhook(logEmbed) // Send the logs to the logs channel
        }

        async function createAndDeleteWebhook(embedName) {
            await logChannel
                .createWebhook({
                    // Creates a webhook in the logging channel specified before
                    name: member.guild.name,
                    avatar: member.guild.iconURL(),
                    reason: '自動踢出小號系統'
                })
                .then((webhook) => {
                    webhook
                        .send({
                            // Sends the embed through the webhook
                            embeds: [embedName]
                        })
                        .then(() => webhook.delete().catch(() => {})) // Deletes the webhook and catches the error if any
                })
        }
    }
}
