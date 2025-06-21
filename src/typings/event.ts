import type { PaperClient } from '@/classes/PaperClient.js'
import { Collection, Events, REST } from 'discord.js'

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
