const { EmbedBuilder, MessageFlags } = require('discord.js')
const Giveaway = require('../../Structures/Schemas/Giveaway')
const GiveawayStats = require('../../Structures/Schemas/GiveawayStats')

module.exports = {
    id: 'giveaway-join',
    async execute(interaction, client) {
        const giveaway = await Giveaway.findOne({
            messageId: interaction.message.id,
            ended: false
        })

        if (!giveaway) {
            return interaction.reply({
                content: '<:timeout:1265562396412608623> | 這個抽獎活動已經結束或不存在！',
                flags: MessageFlags.Ephemeral
            })
        }

        // 檢查參加資格
        const member = interaction.member
        const errors = []

        // 檢查必要身分組
        if (giveaway.requiredRoles?.length > 0) {
            const hasRequiredRole = giveaway.requiredRoles.some((roleId) =>
                member.roles.cache.has(roleId)
            )
            if (!hasRequiredRole) {
                errors.push('<:warning:1265562532857380936> | 你沒有參加此抽獎所需的身分組！')
            }
        }

        // 檢查黑名單身分組
        if (giveaway.blacklistedRoles?.length > 0) {
            const hasBlacklistedRole = giveaway.blacklistedRoles.some((roleId) =>
                member.roles.cache.has(roleId)
            )
            if (hasBlacklistedRole) {
                errors.push('<:warning:1265562532857380936> | 你有被禁止參加此抽獎的身分組！')
            }
        }

        // 檢查帳號年齡
        if (giveaway.minAccountAge) {
            const accountAge = (Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24)
            if (accountAge < giveaway.minAccountAge) {
                errors.push(
                    `<:warning:1265562532857380936> | 你的帳號年齡需要至少 ${giveaway.minAccountAge} 天！`
                )
            }
        }

        // 檢查伺服器時間
        if (giveaway.minServerTime) {
            const serverTime = (Date.now() - member.joinedTimestamp) / (1000 * 60 * 60 * 24)
            if (serverTime < giveaway.minServerTime) {
                errors.push(
                    `<:warning:1265562532857380936> | 你需要在伺服器待滿 ${giveaway.minServerTime} 天！`
                )
            }
        }

        if (errors.length > 0) {
            return interaction.reply({
                content: `<:outage:1265561329528471613> | 無法參加抽獎：\n${errors.join('\n')}`,
                flags: MessageFlags.Ephemeral
            })
        }

        // 處理參加/取消參加
        if (giveaway.participants.includes(interaction.user.id)) {
            // 取消參加
            giveaway.participants = giveaway.participants.filter((id) => id !== interaction.user.id)
            await giveaway.save()

            const embed = EmbedBuilder.from(interaction.message.embeds[0])
            const description = embed.data.description
                .split('\n')
                .map((line) => {
                    if (line.includes('參加人數')) {
                        return `<:people:1265561435220611196> | 參加人數：${giveaway.participants.length}`
                    }
                    return line
                })
                .join('\n')
            embed.setDescription(description)

            await interaction.message.edit({ embeds: [embed] })
            return interaction.reply({
                content: '<:leave:1265560726240497684> | 你已退出這個抽獎活動',
                flags: MessageFlags.Ephemeral
            })
        } else {
            // 參加抽獎
            giveaway.participants.push(interaction.user.id)
            await giveaway.save()

            // 更新統計
            const stats = await GiveawayStats.findOne({
                guildId: interaction.guildId
            })
            if (stats) {
                stats.totalParticipants++
                await stats.save()
            }

            const embed = EmbedBuilder.from(interaction.message.embeds[0])
            const description = embed.data.description
                .split('\n')
                .map((line) => {
                    if (line.includes('參加人數')) {
                        return `<:people:1265561435220611196> | 參加人數：${giveaway.participants.length}`
                    }
                    return line
                })
                .join('\n')
            embed.setDescription(description)

            await interaction.message.edit({ embeds: [embed] })
            return interaction.reply({
                content: '<:join:1265560607797678132> | 你已成功參加抽獎！',
                flags: MessageFlags.Ephemeral
            })
        }
    }
}
