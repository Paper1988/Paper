import type { PaperClient } from '@/Structures/classes/PaperClient.js'

/** 重新初始化所有 Moonlink 音樂節點，回傳重新載入的節點數量。 */
export function reloadMusicNodes(client: PaperClient): number {
    if (!client.moonlink) {
        throw new Error('Moonlink 音樂節點未啟用')
    }

    const identifiers = [...client.moonlink.nodes.nodes.keys()]

    for (const identifier of identifiers) {
        client.moonlink.nodes.remove(identifier)
    }

    client.moonlink.nodes.init()

    return identifiers.length
}
