import { Client } from 'discord.js'
import { loadFiles } from '../Functions/fileLoader'

declare module 'discord.js' {
    interface Client {
        modals: Map<string, any>
    }
}

export async function loadModals(client: Client): Promise<void> {
    client.modals.clear()
    console.time('Modals Loaded')

    const modals: { Modals: string; Status: string }[] = []
    const Files = await loadFiles('Modals')

    for (const file of Files) {
        const modalFile = (await import(file)).default
        if (!modalFile.id) continue

        client.modals.set(modalFile.id, modalFile)
        modals.push({ Modals: modalFile.id, Status: '✅' })
    }

    console.table(modals, ['Modals', 'Status'])
    console.info('\n\x1b[36m%s\x1b[0m', 'Loaded Modals.')
    console.timeEnd('Modals Loaded')
}
