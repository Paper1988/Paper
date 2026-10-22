import {
    ContainerBuilder,
    MessageFlags,
    SeparatorBuilder,
    SeparatorSpacingSize,
    TextDisplayBuilder,
    type InteractionReplyOptions,
} from 'discord.js'

export interface BotInfoViewModel {
    username: string
    userId: string
    createdTimestamp: number
    owner: string
    verified: boolean
    tags: string[]
    commandCount: number
    operatingSystem: string
    uptimeTimestamp: number | null
    ping: number
    cpu: string
    memoryUsagePercentage: number
    databaseStatus: string
    nodeVersion: string
    discordJsVersion: string
    activePlayers: number
    guildCount: number
    cachedUserCount: number
    cachedEmojiCount: number
    textChannelCount: number
    voiceChannelCount: number
    threadCount: number
}

const divider = () =>
    new SeparatorBuilder()
        .setDivider(true)
        .setSpacing(SeparatorSpacingSize.Small)

/** Compact Editorial × Monochrome bot information panel. */
export function buildBotInfoMessage(info: BotInfoViewModel): InteractionReplyOptions {
    const createdAt = Math.floor(info.createdTimestamp / 1000)
    const uptime = info.uptimeTimestamp
        ? `<t:${Math.floor(info.uptimeTimestamp / 1000)}:R>`
        : '尚未取得'
    const tags = info.tags.length
        ? info.tags.map((tag) => `\`${tag}\``).join(' · ')
        : '無'

    const container = new ContainerBuilder()
        .setAccentColor(0xA3A3A3)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `# ${info.username}\n` +
                    `Paper · 機器人資訊 · 建立於 <t:${createdAt}:D> (<t:${createdAt}:R>)`,
            ),
        )
        .addSeparatorComponents(divider())
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                '## 基本資料\n' +
                    `**ID** · \`${info.userId}\`  |  **擁有者** · ${info.owner}\n` +
                    `**驗證** · ${info.verified ? '已驗證' : '未驗證'}  |  **指令** · ${info.commandCount}\n` +
                    `**標籤** · ${tags}`,
            ),
        )
        .addSeparatorComponents(divider())
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                '## 運作狀態\n' +
                    `**Ping** · ${info.ping} ms  |  **上線** · ${uptime}\n` +
                    `**資料庫** · ${info.databaseStatus}  |  **記憶體** · ${info.memoryUsagePercentage.toFixed(1)}%\n` +
                    `**音樂播放器** · ${info.activePlayers} 個\n` +
                    `-# ${info.operatingSystem} · CPU: ${info.cpu} · Node.js ${info.nodeVersion} · Discord.js ${info.discordJsVersion}`,
            ),
        )
        .addSeparatorComponents(divider())
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                '## 規模（快取）\n' +
                    `**伺服器** · ${info.guildCount}  |  **使用者** · ${info.cachedUserCount}\n` +
                    `**文字／論壇頻道** · ${info.textChannelCount}  |  **語音／舞台頻道** · ${info.voiceChannelCount}\n` +
                    '-# 統計來自目前快取，可能與實際總數不同。',
            ),
        )

    return {
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        components: [container],
    }
}
