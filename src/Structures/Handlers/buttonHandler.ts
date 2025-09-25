import { loadFiles } from '@/Structures/Functions/fileLoader.js'
import type { PaperClient } from '@/classes/PaperClient.js'

export async function loadButtons(client: PaperClient): Promise<void> {
    console.time('Buttons Loaded')
    client.buttons.clear()

    const buttons: { Buttons: string; Status: string }[] = []
    const Files = await loadFiles('Buttons')

    for (const file of Files) {
        const buttonFile = (await import(file)).default

        if (!buttonFile.id) continue

        client.buttons.set(buttonFile.id, buttonFile)
        buttons.push({ Buttons: buttonFile.id, Status: '✅' })
    }

    console.table(buttons, ['Buttons', 'Status'])
    console.info('\n\x1b[36m%s\x1b[0m', 'Loaded Buttons.')
    console.timeEnd('Buttons Loaded')
}
