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

/**
 * Render bot information with the Paper Editorial × Monochrome UI.
 * Keep the content grouped by user intent: identity, runtime, and footprint.
 */
export function buildBotInfoMessage(info: BotInfoViewModel): InteractionReplyOptions {
    const createdAt = Math.floor(info.createdTimestamp / 1000)
    const uptime = info.uptimeTimestamp
        ? `<t:${Math.floor(info.uptimeTimestamp / 1000)}:R>`
        : '尚未取得'
    const tags = info.tags.length
        ? info.tags.map((tag) => `\`${tag}\``).join(' · ')
        : '無'

    const container = new ContainerBuilder()
        .setAccentColor(0x171717)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `# ${info.username}\n` +
                    'Paper · 機器人資訊\n' +
                    `帳號建立於 <t:${createdAt}:D> · <t:${createdAt}:R>`,
            ),
        )
        .addSeparatorComponents(divider())
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                '## 身分資料\n' +
                    `**用戶 ID**\n\`${info.userId}\`\n` +
                    `**擁有者**\n${info.owner}\n` +
                    `**驗證狀態**\n${info.verified ? '已驗證' : '未驗證'}\n` +
                    `**應用程式標籤**\n${tags}\n` +
                    `**可用指令**\n${info.commandCount}`,
            ),
        )
        .addSeparatorComponents(divider())
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                '## 執行狀態\n' +
                    `**延遲** · ${info.ping} ms\n` +
                    `**上線時間** · ${uptime}\n` +
                    `**作業系統** · ${info.operatingSystem}\n` +
                    `**CPU** · ${info.cpu}\n` +
                    `**系統記憶體使用率** · ${info.memoryUsagePercentage.toFixed(1)}%\n` +
                    `**資料庫** · ${info.databaseStatus}\n` +
                    `**Node.js** · ${info.nodeVersion}\n` +
                    `**Discord.js** · ${info.discordJsVersion}\n` +
                    `**播放中的播放器** · ${info.activePlayers}`,
            ),
        )
        .addSeparatorComponents(divider())
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                '## 快取與規模\n' +
                    `**伺服器** · ${info.guildCount}\n` +
                    `**使用者** · ${info.cachedUserCount}\n` +
                    `**表情符號** · ${info.cachedEmojiCount}\n` +
                    `**文字／論壇頻道** · ${info.textChannelCount}\n` +
                    `**語音／舞台頻道** · ${info.voiceChannelCount}\n` +
                    `**討論串** · ${info.threadCount}\n\n` +
                    '-# 部分數據來自目前快取，可能與實際總數不同。',
            ),
        )

    return {
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        components: [container],
    }
}
