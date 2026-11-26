import type { Player } from 'moonlink.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'

export class MusicStateManager {
    static getControllerMessageId(client: PaperClient, player: Player): string | undefined {
        return client.musicSessions.getControllerMessageId(player.guildId)
    }

    static setControllerMessageId(client: PaperClient, player: Player, messageId: string): void {
        client.musicSessions.setControllerMessageId(player.guildId, messageId)
    }

    static resetControllerMessageId(client: PaperClient, player: Player): void {
        client.musicSessions.setControllerMessageId(player.guildId, undefined)
    }
}
