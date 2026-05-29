import BlackListGuild from '@/Structures/Schemas/BlacklistGuild.js'
import BlackListUser from '@/Structures/Schemas/BlacklistUser.js'
import { cacheGetJson, cacheSetJsonWithTTL } from '@/libs/utils/redis.js'
import { type Interaction, EmbedBuilder } from 'discord.js'

type BlacklistCacheEntry = {
    Reason?: string
    Time?: number
} | null

const BLACKLIST_CACHE_TTL_SECONDS = 60

async function getCachedBlacklistEntry(
    key: string,
    loader: () => Promise<BlacklistCacheEntry>
): Promise<BlacklistCacheEntry> {
    const cached = await cacheGetJson<BlacklistCacheEntry | { miss: true }>(key)
    if (cached) return 'miss' in cached ? null : cached

    const entry = await loader()
    cacheSetJsonWithTTL(key, entry ?? { miss: true }, BLACKLIST_CACHE_TTL_SECONDS).catch(() => {})
    return entry
}

/**
 * 檢查用戶或伺服器是否在黑名單中
 */
export async function checkBlacklist(interaction: Interaction): Promise<boolean> {
    if (!interaction.guild) return false

    const [GuildData, UserData] = await Promise.all([
        getCachedBlacklistEntry(`blacklist:guild:${interaction.guild.id}`, () =>
            BlackListGuild.findOne({ Guild: interaction.guild!.id }, { Reason: 1, Time: 1 })
                .lean<BlacklistCacheEntry>()
                .exec()
        ),
        getCachedBlacklistEntry(`blacklist:user:${interaction.user.id}`, () =>
            BlackListUser.findOne({ User: interaction.user.id }, { Reason: 1, Time: 1 })
                .lean<BlacklistCacheEntry>()
                .exec()
        )
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
