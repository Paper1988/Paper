import { PaperClient } from '@/Structures/classes/PaperClient.js'
import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    MessageFlags,
    SlashCommandBuilder
} from 'discord.js'

function getMusicNodeInfo(client: PaperClient, guildId?: string | null): string {
    if (!client.moonlink) return '音樂節點: 未啟用'

    const nodeManager = client.moonlink.nodes
    const totalNodes = nodeManager.nodes.size
    const onlineCount = nodeManager.onlineNodes.length
    const readyCount = nodeManager.ready.length
    const readyIds = new Set(
        nodeManager.ready.map((node: { identifier: string }) => node.identifier)
    )

    const localPlayersByNode = new Map<string, number>()
    for (const player of client.moonlink.players.all) {
        const id = player.node.identifier
        localPlayersByNode.set(id, (localPlayersByNode.get(id) ?? 0) + 1)
    }

    const nodeLines = [...nodeManager.nodes.values()].map((node) => {
        const status = readyIds.has(node.identifier) ? '就緒' : node.connected ? '連線中' : '離線'
        const ping = node.latency >= 0 ? `${node.latency}ms` : 'N/A'
        const remotePlayers = node.stats?.players ?? '-'
        const localPlayers = localPlayersByNode.get(node.identifier) ?? 0
        return `  ${node.identifier}: ${status} | Ping ${ping} | 本機 ${localPlayers} | 節點 ${remotePlayers}`
    })

    const playerCount = client.moonlink.players.size
    const playingCount = client.moonlink.players.playingPlayers.length

    const lines = [
        `音樂節點: ${onlineCount}/${totalNodes} 已連線, ${readyCount} 就緒`,
        `播放器: ${playingCount}/${playerCount} 正在播放`
    ]

    if (guildId) {
        const guildPlayer = client.moonlink.players.get(guildId)
        lines.push(
            guildPlayer
                ? `本伺服器節點: ${guildPlayer.node.identifier}`
                : '本伺服器節點: 無播放器'
        )
    }

    lines.push(...nodeLines)
    return lines.join('\n')
}

export default {
    developer: true,
    data: new SlashCommandBuilder().setName('debug').setDescription('(僅限開發人員)'),
    async execute(interaction: ChatInputCommandInteraction, client: PaperClient) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral })

        const commandsCount = client.commands.size
        const eventsCount = client.events?.size ?? 0
        const buttonsCount = client.buttons.size
        const subsCount = client.subCommands.size
        const modalsCount = client.modals.size
        const menusCount = client.selectMenus.size
        const contextCount = client.contextMenus.size
        const guildCount = client.guilds.cache.size
        const userCount = client.users.cache.size
        const musicNodeInfo = getMusicNodeInfo(client, interaction.guildId)

        const logStr = `命令數量: ${commandsCount}\n事件數量: ${eventsCount}\n按鈕數量: ${buttonsCount}\n子命令數量: ${subsCount}\n模態對話框: ${modalsCount}\n選單數量: ${menusCount}\n右鍵菜單: ${contextCount}\n伺服器數: ${guildCount}\n用戶數: ${userCount}\n互動 ID: ${interaction.id}\n用戶 ID: ${interaction.user.id}\nNode.js 版本: ${process.version}\n機器人延遲: ${client.ws.ping}ms\n記憶體用量: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\n${musicNodeInfo}`

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle('🔍 Debug Information')
            .setDescription('```' + logStr + '```')
            .setFooter({ text: 'Interaction Test Success!' })
            .setTimestamp()

        await interaction.editReply({ embeds: [embed] })
    }
}
