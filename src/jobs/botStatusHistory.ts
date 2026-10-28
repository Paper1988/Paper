import BotStatusHistory from '@/Structures/Schemas/BotStatusHistory.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'

/** Persist a heartbeat every five minutes for the Dashboard uptime chart. */
export async function recordBotStatus(client: PaperClient) {
    await BotStatusHistory.create({
        timestamp: new Date(),
        status: client.isReady() ? 1 : 0
    })
}
