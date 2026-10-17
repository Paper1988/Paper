import { Profile } from 'discord-arts'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import {
    AttachmentBuilder,
    ChatInputCommandInteraction,
    ContainerBuilder,
    GuildMember,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    MessageFlags,
    SeparatorBuilder,
    SeparatorSpacingSize,
    SlashCommandBuilder,
    TextDisplayBuilder,
} from 'discord.js'

const divider = () =>
    new SeparatorBuilder()
        .setDivider(true)
        .setSpacing(SeparatorSpacingSize.Small)

function formatDate(timestamp: number | null): string {
    if (timestamp === null) return '未知'
    return `<t:${Math.floor(timestamp / 1000)}:D> · <t:${Math.floor(timestamp / 1000)}:R>`
}

function formatBadges(badgeNames: string[]): string {
    const badgeMap: Record<string, string> = {
        ActiveDeveloper: '<:activedeveloper:1201841218586152990>',
        BugHunterLevel1: '<:discordbughunter1:1201841226681438238>',
        BugHunterLevel2: '<:discordbughunter2:1201841229281898536>',
        PremiumEarlySupporter: '<:discordearlysupporter:1201841232125362196>',
        Partner: '<:discordpartner:1201841240371367936>',
        Staff: '<:discordstaff:1201841242431033394>',
        HypeSquadOnlineHouse1: '<:hypesquadbravery:1201841247875235920>',
        HypeSquadOnlineHouse2: '<:hypesquadbrilliance:1201841250987409408>',
        HypeSquadOnlineHouse3: '<:hypesquadbalance:1201841246390468629>',
        Hypesquad: '<:hypesquadevents:1201841254380601364>',
        CertifiedModerator: '<:discordmod:1201841233711079424>',
        VerifiedDeveloper: '<:discordbotdev:1201841223250223105>',
    }

    const badges = badgeNames.map((name) => badgeMap[name] ?? '❔')
    return badges.length ? badges.join(' ') : '無公開徽章'
}

function buildUserInfo(
    member: GuildMember,
    profileAttachmentUrl: string,
    bannerUrl: string | null,
): ContainerBuilder {
    const user = member.user
    const roles = member.roles.cache
        .filter((role) => role.id !== member.guild.id)
        .sort((a, b) => b.position - a.position)
        .first(3)
    const topRoles = roles.length ? roles.map((role) => role.toString()).join(' ') : '無其他身分組'
    const badges = formatBadges(user.flags?.toArray() ?? [])
    const joinedAt = formatDate(member.joinedTimestamp)
    const createdAt = formatDate(user.createdTimestamp)
    const boosterStatus = member.premiumSince ? '是' : '否'

    return new ContainerBuilder()
        .setAccentColor(0xA3A3A3)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `# ${user.globalName ?? user.username}\n` +
                `@${user.username} · 使用者資訊\n\n` +
                `**使用者 ID** · \`${user.id}\`\n` +
                `**帳號建立** · ${createdAt}\n` +
                `**加入伺服器** · ${joinedAt}`,
            ),
        )
        .addSeparatorComponents(divider())
        .addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
                new MediaGalleryItemBuilder().setURL(profileAttachmentUrl),
            ),
        )
        .addSeparatorComponents(divider())
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                '## 伺服器資料\n' +
                `**最高身分組**\n${topRoles}\n\n` +
                `**Nitro 伺服器加成** · ${boosterStatus}\n` +
                `**公開徽章** · ${badges}`,
            ),
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                bannerUrl
                    ? `[查看使用者橫幅](${bannerUrl})`
                    : '此使用者沒有可公開顯示的橫幅。',
            ),
        )
}

export default {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setNameLocalization('zh-TW', '用戶資訊')
        .setNameLocalization('ja', 'ユーザー情報')
        .setDescription('Get information about a specified user')
        .setDescriptionLocalization('zh-TW', '取得指定用戶的資訊')
        .setDescriptionLocalization('ja', '指定されたユーザーの情報を取得します')
        .addUserOption((option) =>
            option
                .setName('member')
                .setNameLocalization('zh-TW', '用戶')
                .setNameLocalization('ja', 'ユーザー')
                .setDescription('Choose a user')
                .setDescriptionLocalization('zh-TW', '選擇一個用戶')
                .setDescriptionLocalization('ja', 'ユーザーを選択')
                .setRequired(false),
        ),
    async execute(interaction: ChatInputCommandInteraction, _client: PaperClient) {
        await interaction.deferReply({
            flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
        })

        if (!interaction.guild) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xA3A3A3)
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        '# 無法取得使用者資料\n請在伺服器中使用此指令。',
                    ),
                )
            return interaction.editReply({ components: [errorContainer] })
        }

        const targetUser = interaction.options.getUser('member') ?? interaction.user
        if (targetUser.bot) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xA3A3A3)
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        '# 暫不支援機器人帳號\n目前的個人資料卡只支援一般使用者。',
                    ),
                )
            return interaction.editReply({ components: [errorContainer] })
        }

        try {
            const [profileBuffer, fetchedUser] = await Promise.all([
                Profile(targetUser.id),
                targetUser.fetch(),
            ])
            const member = await interaction.guild.members.fetch(targetUser.id)
            const profileAttachment = new AttachmentBuilder(profileBuffer, {
                name: 'profile.png',
            })
            const container = buildUserInfo(
                member,
                'attachment://profile.png',
                fetchedUser.bannerURL(),
            )

            return interaction.editReply({
                components: [container],
                files: [profileAttachment],
            })
        } catch (error) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xA3A3A3)
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        '# 無法載入使用者資料\n資料服務暫時沒有回應，請稍後再試。如果問題持續發生，請使用 `/feedback` 回報。',
                    ),
                )
            await interaction.editReply({ components: [errorContainer] })
            throw error
        }
    },
}
