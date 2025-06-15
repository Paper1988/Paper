import type { PaperClient } from '@/classes/PaperClient.js'
import type { EventType } from '@/typings/event.js'
import { Collection, REST } from 'discord.js'
import path from 'node:path'
import { loadFiles } from '../Functions/fileLoader.js'

interface Event {
    name: string
    once?: boolean
    rest?: boolean
    execute: (...args: any[]) => void
}

declare module 'discord.js' {
    interface Client {
        events: Collection<string, any> | Map<string, any>
        rest: REST
    }
}

function validateEvent(event: any): event is Event {
    return (
        typeof event === 'object' &&
        typeof event.name === 'string' &&
        typeof event.execute === 'function'
    )
}

export async function loadEvents(client: PaperClient): Promise<void> {
    console.time('Events Loaded')
    client.events = new Collection<string, EventType>()
    const events: Array<{ Event: string; Status: string; Error?: string }> = []

    const files = await loadFiles('Events')

    for (const file of files) {
        try {
            const importedEvent = (await import(file)).default || (await import(file))

            if (!validateEvent(importedEvent)) {
                throw new Error('Invalid event structure')
            }

            const event: Event = importedEvent
            const execute = (...args: any[]) => event.execute(client, ...args)
            const target = event.rest ? client.rest : client

            const eventHandler = event.once ? 'once' : 'on'
            ;(target as any)[eventHandler](event.name, execute)
            client.events.set(event.name, execute)

            events.push({ Event: event.name, Status: '🔰' })
        } catch (err) {
            const fileName = path.basename(file).replace(/\.js$|\.ts$/, '')
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            events.push({
                Event: fileName,
                Status: '🛑',
                Error: errorMessage
            })
            console.error(`Failed to load event ${fileName}:`, err)
        }
    }

    console.table(events, ['Event', 'Status', 'Error'])
    console.info('\n\x1b[36m%s\x1b[0m', 'Loaded Events')
    console.timeEnd('Events Loaded')
}
