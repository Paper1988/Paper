import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    ContainerBuilder,
    MessageFlags,
    SeparatorBuilder,
    SeparatorSpacingSize,
    SlashCommandBuilder,
    TextDisplayBuilder,
} from 'discord.js'

type MinecraftEdition = 'java' | 'bedrock'

interface MinecraftServerResponse {
    online: boolean
    host?: string
    port?: number
    version?: {
        name?: string
        name_clean?: string
    }
    players?: {
        max?: number
        online?: number
    }
    motd?: {
        clean?: string
        raw?: string
    }
}

const ACCENT_COLOR = 0xA3A3A3
const REFRESH_CUSTOM_ID = 'mcstats:refresh'
const REFRESH_TIMEOUT_MS = 15 * 60 * 1000

function divider() {
    return new SeparatorBuilder()
        .setDivider(true)
        .setSpacing(SeparatorSpacingSize.Small)
}

function buildContainer(title: string, body: string): ContainerBuilder {
    return new ContainerBuilder()
        .setAccentColor(ACCENT_COLOR)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# ${title}\n${body}`),
        )
}

function buildServerInfo(
    address: string,
    edition: MinecraftEdition,
    data: MinecraftServerResponse,
): ContainerBuilder {
    const editionLabel = edition === 'java' ? 'Java Edition' : 'Bedrock Edition'

    const details = [
        `**版本** · ${data.version?.name_clean || data.version?.name || '未知'}`,
        `**在線玩家** · ${typeof data.players?.online === 'number' && typeof data.players?.max === 'number'
            ? `${data.players.online.toLocaleString()} / ${data.players.max.toLocaleString()}`
            : '目前無法取得'`,
    ]

    const motd = data.motd?.clean?.trim()
    if (motd) {
        const safeMotd = motd.length > 300 ? `${motd.slice(0, 297)}…` : motd
        details.push(`**伺服器公告**\n${safeMotd.replace(/([\\\\`*_{}\[\]()#+\-.!|>])/g, '\\\\$1')}`)
    }

    return new ContainerBuilder()
        .setAccentColor(ACCENT_COLOR)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `# Minecraft 伺服器\n` +
                `**${address}** · ${editionLabel}\n\n` +
                `**狀態** · ${data.online ? '在線' : '離線'}\n` +
                details.join('\n'),
            ),
        )
        .addSeparatorComponents(divider())
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                '資料由 mcstatus.io 提供，狀態與玩家數可能有短暫延遲。',
            ),
        )
}

function buildRefreshRow(disabled = false) {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId(REFRESH_CUSTOM_ID)
            .setLabel('刷新資料')
            .setEmoji('🔄')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(disabled),
    )
}

async function fetchServerStatus(
    address: string,
    edition: MinecraftEdition,
): Promise<MinecraftServerResponse> {
    const url = `https://api.mcstatus.io/v2/status/${edition}/${encodeURIComponent(address)}`
    const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(8_000),
    })

    if (!response.ok) {
        const detail = (await response.text()).slice(0, 200)
        throw new Error(`mcstatus.io returned HTTP ${response.status}: ${detail}`)
    }

    const data: unknown = await response.json()
    if (
        typeof data !== 'object' ||
        data === null ||
        !('online' in data) ||
        typeof data.online !== 'boolean'
    ) {
        throw new Error('mcstatus.io returned an invalid response')
    }

    return data as MinecraftServerResponse
}

export default {
    data: new SlashCommandBuilder()
        .setName('mcstats')
        .setNameLocalization('zh-TW', '伺服器資訊')
        .setNameLocalization('ja', 'マインクラフトサーバー情報')
        .setDescription('Display Minecraft server information')
        .setDescriptionLocalization('zh-TW', '顯示 Minecraft 伺服器的資訊')
        .setDescriptionLocalization('ja', 'Minecraft サーバーの情報を表示')
        .addStringOption((option) =>
            option
                .setName('server-ip')
                .setNameLocalization('zh-TW', '伺服器ip')
                .setNameLocalization('ja', 'サーバーip')
                .setDescription('IP address or hostname of the server')
                .setDescriptionLocalization('zh-TW', '伺服器的 IP 或網域名稱')
                .setDescriptionLocalization('ja', 'サーバーの IP アドレスまたはホスト名')
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName('edition')
                .setNameLocalization('zh-TW', '版本')
                .setNameLocalization('ja', 'エディション')
                .setDescription('Minecraft server edition')
                .setDescriptionLocalization('zh-TW', '選擇 Minecraft 伺服器版本')
                .setDescriptionLocalization('ja', 'Minecraft サーバーのエディションを選択')
                .addChoices(
                    { name: 'Java Edition', value: 'java' },
                    { name: 'Bedrock Edition', value: 'bedrock' },
                )
                .setRequired(true),
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const address = interaction.options.getString('server-ip')?.trim()
        const edition = interaction.options.getString('edition') as MinecraftEdition | null

        if (
            !address ||
            address.length > 253 ||
            /[\s/\\]/.test(address) ||
            !edition ||
            !['java', 'bedrock'].includes(edition)
        ) {
            return interaction.reply({
                flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
                components: [
                    buildContainer(
                        '輸入資料無效',
                        '請輸入有效的 Minecraft 伺服器 IP 或網域名稱，並選擇 Java 或 Bedrock Edition。',
                    ),
                ],
            })
        }

        const normalizedAddress = address.toLowerCase()
        const editionLabel = edition === 'java' ? 'Java Edition' : 'Bedrock Edition'
        const loadingContainer = buildContainer(
            '正在查詢 Minecraft 伺服器…',
            `正在查詢 ${editionLabel} 伺服器 \`${normalizedAddress}\` 的狀態。`,
        )

        await interaction.reply({
            flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
            components: [loadingContainer],
        })

        let currentContainer: ContainerBuilder

        try {
            const data = await fetchServerStatus(normalizedAddress, edition)
            currentContainer = buildServerInfo(normalizedAddress, edition, data)
        } catch (error) {
            console.error('[mcstats] Failed to fetch server status:', error)
            currentContainer = buildContainer(
                '查詢服務暫時無法使用',
                `目前無法取得 \`${normalizedAddress}\` 的狀態。請確認伺服器位址與版本選擇正確，或稍後再試。`,
            )
        }

        await interaction.editReply({
            components: [currentContainer, buildRefreshRow()],
        })

        const message = await interaction.fetchReply()
        const collector = message.createMessageComponentCollector({
            time: REFRESH_TIMEOUT_MS,
        })

        collector.on('collect', async (buttonInteraction) => {
            if (buttonInteraction.customId !== REFRESH_CUSTOM_ID) return

            await buttonInteraction.deferUpdate()

            try {
                const data = await fetchServerStatus(normalizedAddress, edition)
                currentContainer = buildServerInfo(normalizedAddress, edition, data)
            } catch (error) {
                console.error('[mcstats] Failed to refresh server status:', error)
                currentContainer = buildContainer(
                    '刷新失敗',
                    `暫時無法更新 \`${normalizedAddress}\` 的狀態，請稍後再試。`,
                )
            }

            await interaction.editReply({
                components: [currentContainer, buildRefreshRow()],
            })
        })

        collector.on('end', async () => {
            try {
                await interaction.editReply({
                    components: [currentContainer, buildRefreshRow(true)],
                })
            } catch {
                // The original interaction may have expired or the message may have been deleted.
            }
        })
    },
}
