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

interface MinecraftServerResponse {
    status: 'success' | 'error'
    online?: boolean
    server?: {
        name: string
    }
    players?: {
        max: number
        now: number
    }
}

const ACCENT_COLOR = 0xA3A3A3
const REFRESH_CUSTOM_ID = 'mcstats:refresh'
const REFRESH_TIMEOUT_MS = 5 * 60 * 1000

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

function buildServerInfo(ip: string, data: MinecraftServerResponse): ContainerBuilder {
    if (
        data.status !== 'success' ||
        !data.server ||
        !data.players ||
        typeof data.online !== 'boolean'
    ) {
        return buildContainer(
            '無法取得伺服器資訊',
            `無法讀取 \`${ip}\` 的狀態。請確認 IP 或網域正確，伺服器也可能暫時無法連線。`,
        )
    }

    return new ContainerBuilder()
        .setAccentColor(ACCENT_COLOR)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `# Minecraft 伺服器\n` +
                `**${data.server.name || ip}**\n\n` +
                `**狀態** · ${data.online ? '在線' : '離線'}\n` +
                `**伺服器位址** · \`${ip}\`\n` +
                `**在線玩家** · ${data.players.now.toLocaleString()} / ${data.players.max.toLocaleString()}`,
            ),
        )
        .addSeparatorComponents(divider())
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                '資料由 Minecraft 伺服器狀態服務提供，玩家數可能有短暫延遲。',
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

async function fetchServerStatus(ip: string): Promise<MinecraftServerResponse> {
    const url = new URL('https://mcapi.us/server/status')
    url.searchParams.set('ip', ip)

    const response = await fetch(url, {
        signal: AbortSignal.timeout(8_000),
    })

    if (!response.ok) {
        throw new Error(`Minecraft status API returned HTTP ${response.status}`)
    }

    return await response.json() as MinecraftServerResponse
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
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const ip = interaction.options.getString('server-ip')?.trim()

        if (!ip || ip.length > 253 || /[\s/\\]/.test(ip)) {
            return interaction.reply({
                flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
                components: [
                    buildContainer(
                        '伺服器位址無效',
                        '請輸入有效的 Minecraft 伺服器 IP 或網域名稱。',
                    ),
                ],
            })
        }

        const normalizedIp = ip.toLowerCase()
        const loadingContainer = buildContainer(
            '正在查詢 Minecraft 伺服器…',
            `正在取得 \`${normalizedIp}\` 的即時狀態。`,
        )

        await interaction.reply({
            flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
            components: [loadingContainer],
        })

        try {
            const data = await fetchServerStatus(normalizedIp)
            await interaction.editReply({
                components: [buildServerInfo(normalizedIp, data), buildRefreshRow()],
            })
        } catch (error) {
            console.error('[mcstats] Failed to fetch server status:', error)
            await interaction.editReply({
                components: [
                    buildContainer(
                        '查詢失敗',
                        `目前無法取得 \`${normalizedIp}\` 的狀態，可能是查詢服務暫時無法使用。請稍後再試。`,
                    ),
                    buildRefreshRow(),
                ],
            })
        }

        const message = await interaction.fetchReply()
        const collector = message.createMessageComponentCollector({
            time: REFRESH_TIMEOUT_MS,
        })

        collector.on('collect', async (buttonInteraction) => {
            if (buttonInteraction.customId !== REFRESH_CUSTOM_ID) return

            await buttonInteraction.deferUpdate()

            try {
                const data = await fetchServerStatus(normalizedIp)
                await interaction.editReply({
                    components: [buildServerInfo(normalizedIp, data), buildRefreshRow()],
                })
            } catch (error) {
                console.error('[mcstats] Failed to refresh server status:', error)
                await interaction.editReply({
                    components: [
                        buildContainer(
                            '刷新失敗',
                            `暫時無法更新 \`${normalizedIp}\` 的狀態，請稍後再試。`,
                        ),
                        buildRefreshRow(),
                    ],
                })
            }
        })

        collector.on('end', async () => {
            try {
                await interaction.editReply({
                    components: [
                        ...(await getFinalComponents(interaction, normalizedIp)),
                        buildRefreshRow(true),
                    ],
                })
            } catch {
                // The original interaction may have expired or the message may have been deleted.
            }
        })
    },
}

async function getFinalComponents(
    interaction: ChatInputCommandInteraction,
    ip: string,
): Promise<ContainerBuilder[]> {
    try {
        const data = await fetchServerStatus(ip)
        return [buildServerInfo(ip, data)]
    } catch {
        return [buildContainer('查詢已結束', `已停止更新 \`${ip}\` 的狀態。`)]
    }
}
