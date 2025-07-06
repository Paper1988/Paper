import BlackListGuild from '@/Structures/Schemas/BlacklistGuild.js'
import BlackListUser from '@/Structures/Schemas/BlacklistUser.js'
import { type Interaction, EmbedBuilder } from 'discord.js'

/**
 * 檢查用戶或伺服器是否在黑名單中
 */
export async function checkBlacklist(interaction: Interaction): Promise<boolean> {
    if (!interaction.guild) return false

    const [GuildData, UserData] = await Promise.all([
        BlackListGuild.findOne({ Guild: interaction.guild.id }),
        BlackListUser.findOne({ User: interaction.user.id })
    ])

    if (GuildData || UserData) {
        const data = GuildData || UserData
        const time = data?.Time ?? 0
        const reason = data?.Reason ?? '未知原因'
        const isGuild = !!GuildData

        if ('reply' in interaction) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setThumbnail(interaction.guild.iconURL())
                        .setTitle(
                            `該${isGuild ? '伺服器' : '用戶'}為黑名單${isGuild ? '伺服器' : '用戶'}!`
                        )
                        .setDescription(
                            `<:outage:1265561329528471613> | 您${isGuild ? '的伺服器' : ''}已被列入黑名單，自從<t:${time / 1000}:R>, 原因為: **${reason}**`
                        )
                        .setTimestamp()
                ]
            })
        }
        return true
    }

    return false
}
