import emojis from '@/libs/emoji/emoji.js'
import Giveaway from '@/Structures/Schemas/Giveaway.js'
import { deleteMessageAfter } from '@/Systems/Music.js'
import type { ButtonType } from '@/typings/component.js'
import { ButtonInteraction, EmbedBuilder, GuildMember, MessageFlags } from 'discord.js'

export default {
    id: 'giveaway-join',
    async execute(interaction: ButtonInteraction) {
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

        const member = interaction.member as GuildMember
        const errors: string[] = []

        const requiredRoles = giveaway.requiredRoles ?? []
        if (requiredRoles.length > 0) {
            const hasRequiredRole = requiredRoles.some((roleId) => member.roles.cache.has(roleId))
            if (!hasRequiredRole) {
                errors.push(`${emojis.warning} | 你沒有參加此抽獎所需的身分組！`)
            }
        }

        const blacklistedRoles = giveaway.blacklistedRoles ?? []
        if (blacklistedRoles.length > 0) {
            const hasBlacklistedRole = blacklistedRoles.some((roleId) =>
                member.roles.cache.has(roleId)
            )
            if (hasBlacklistedRole) {
                errors.push(`${emojis.warning} | 你有被禁止參加此抽獎的身分組！`)
            }
        }

        if (giveaway.minAccountAge) {
            const accountAge = (Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24)
            if (accountAge < giveaway.minAccountAge) {
                errors.push(
                    `${emojis.warning} | 你的帳號年齡需要至少 ${giveaway.minAccountAge} 天！`
                )
            }
        }

        if (giveaway.minServerTime) {
            const joinedTimestamp = member.joinedTimestamp
            if (!joinedTimestamp) {
                errors.push(`${emojis.warning} | 無法獲取你的加入時間！`)
            } else {
                const serverTime = (Date.now() - joinedTimestamp) / (1000 * 60 * 60 * 24)
                if (serverTime < giveaway.minServerTime) {
                    errors.push(
                        `${emojis.warning} | 你需要在伺服器待滿 ${giveaway.minServerTime} 天！`
                    )
                }
            }
        }

        if (errors.length > 0) {
            return interaction
                .reply({
                    content: `${emojis.outage} | 無法參加抽獎：\n${errors.join('\n')}`,
                    flags: MessageFlags.Ephemeral
                })
                .then(deleteMessageAfter)
        }

        if (giveaway.participants.includes(interaction.user.id)) {
            giveaway.participants = giveaway.participants.filter((id) => id !== interaction.user.id)
            await giveaway.save()

            const embed = EmbedBuilder.from(interaction.message.embeds[0]!)
            const description = embed.data
                .description!.split('\n')
                .map((line) => {
                    if (line.includes('參加人數')) {
                        return `**參加人數** · ${giveaway.participants.length}`
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
            giveaway.participants.push(interaction.user.id)
            await giveaway.save()

            const embed = EmbedBuilder.from(interaction.message.embeds[0]!)
            const description = embed.data
                .description!.split('\n')
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
} satisfies ButtonType
