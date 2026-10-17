import {
    ChannelType,
    ChatInputCommandInteraction,
    ContainerBuilder,
    MessageFlags,
    SlashCommandBuilder,
    TextDisplayBuilder,
} from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setNameLocalization('zh-TW', '伺服器資訊')
        .setNameLocalization('ja', 'サーバー情報')
        .setDescription('Get information about the server')
        .setDescriptionLocalization('zh-TW', '取得伺服器資訊')
        .setDescriptionLocalization('ja', 'サーバー情報を取得します'),
    async execute(interaction: ChatInputCommandInteraction) {
        const guild = interaction.guild
        if (!guild) {
            await interaction.reply({
                content: '此指令只能在伺服器內使用。',
                flags: MessageFlags.Ephemeral,
            })
            return
        }

        const channels = guild.channels.cache
        const members = guild.members.cache
        const textChannels = channels.filter(
            (channel) =>
                channel.type === ChannelType.GuildText ||
                channel.type === ChannelType.GuildAnnouncement ||
                channel.type === ChannelType.GuildForum,
        ).size
        const voiceChannels = channels.filter(
            (channel) =>
                channel.type === ChannelType.GuildVoice ||
                channel.type === ChannelType.GuildStageVoice,
        ).size
        const threads = channels.filter(
            (channel) =>
                channel.type === ChannelType.PublicThread ||
                channel.type === ChannelType.PrivateThread ||
                channel.type === ChannelType.AnnouncementThread,
        ).size
        const humans = members.filter((member) => !member.user.bot).size
        const bots = members.filter((member) => member.user.bot).size
        const createdAt = Math.floor(guild.createdTimestamp / 1000)
        const bannerUrl = guild.bannerURL({ size: 1024 })

        const container = new ContainerBuilder()
            .setAccentColor(0xA3A3A3)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `# ${guild.name}\n` +
                        'Server overview · 伺服器資訊\n' +
                        `建立於 <t:${createdAt}:D> (<t:${createdAt}:R>)`,
                ),
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    '## 基本資料\n' +
                        `**擁有者** · <@${guild.ownerId}>\n` +
                        `**伺服器 ID** · \`${guild.id}\`\n` +
                        `**伺服器描述** · ${guild.description || '尚未設定'}` +
                        (bannerUrl ? `\n**伺服器橫幅** · [查看橫幅](${bannerUrl})` : ''),
                ),
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    '## 成員\n' +
                        `**總成員** · ${guild.memberCount}  |  **快取使用者** · ${humans}  |  **快取機器人** · ${bots}\n` +
                        `**身分組** · ${guild.roles.cache.size}  |  **伺服器加成** · 等級 ${guild.premiumTier} · ${guild.premiumSubscriptionCount ?? 0} 次`,
                ),
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    '## 頻道與素材\n' +
                        `**文字／公告／論壇** · ${textChannels}  |  **語音／舞台** · ${voiceChannels}\n` +
                        `**討論串** · ${threads}  |  **頻道快取總數** · ${channels.size}\n` +
                        `**表情符號** · ${guild.emojis.cache.size}  |  **貼圖** · ${guild.stickers.cache.size}\n` +
                        '-# 成員與頻道分類統計依目前快取計算，可能不等於完整實際數量。',
                ),
            )

        await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
        })
    },
}
