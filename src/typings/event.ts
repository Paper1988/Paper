import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import type { Collection, REST } from 'discord.js'
import { Events } from 'discord.js'

export type EventExecute = (client: PaperClient, ...args: any[]) => Promise<void> | void

export type EventType = {
    name: Events | string
    once?: boolean
    rest?: boolean
    execute: EventExecute
}

declare module 'discord.js' {
    interface Client {
        events: Collection<string, any> | Map<string, any>
        rest: REST
    }
}
