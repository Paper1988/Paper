import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { loadFiles } from '@/Structures/Functions/fileLoader.js'
import type { EventExecute, EventType } from '@/typings/event.js'
import { Collection } from 'discord.js'
import path from 'node:path'

function validateEvent(event: any): event is EventType {
    return (
        typeof event === 'object' &&
        typeof event.name === 'string' &&
        typeof event.execute === 'function'
    )
}

export async function loadEvents(client: PaperClient): Promise<void> {
    console.time('Events Loaded')
    client.events = new Collection<string, EventExecute>()
    const events: Array<{ Event: string; Status: string; Error?: string }> = []

    const files = await loadFiles('Events')

    for (const file of files) {
        try {
            const importedEvent = (await import(file)).default || (await import(file))

            if (!validateEvent(importedEvent)) {
                throw new Error('Invalid event structure')
            }

            const event = importedEvent
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
