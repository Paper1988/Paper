import { loadFiles } from '@/Structures/Functions/fileLoader.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'

export async function loadMenus(client: PaperClient): Promise<void> {
    console.time('Menus Loaded')
    client.selectMenus.clear()

    const menus: { Menus: string; Status: string }[] = []
    const Files = await loadFiles('Menus')

    for (const file of Files) {
        const menuFile = (await import(file)).default

        if (!menuFile.id) continue

        client.selectMenus.set(menuFile.id, menuFile)
        menus.push({ Menus: menuFile.id, Status: '✅' })
    }

    console.table(menus, ['Menus', 'Status'])
    console.info('\n\x1b[36m%s\x1b[0m', 'Loaded Menus.')
    console.timeEnd('Menus Loaded')
}
