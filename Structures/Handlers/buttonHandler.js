const { loadFiles } = require('../Functions/fileLoader')

async function loadButtons(client) {
    await client.buttons.clear()
    console.time('Buttons Loaded')
    const buttons = new Array()
    const Files = await loadFiles('Buttons')

    Files.forEach(async (file) => {
        const buttonFile = require(file)
        if (!buttonFile.id) return
        client.buttons.set(buttonFile.id, buttonFile)
        buttons.push({ Buttons: buttonFile.id, Status: '✅' })
    })

    console.table(buttons, ['Buttons', 'Status'])
    console.info('\n\x1b[36m%s\x1b[0m', 'Loaded Buttons.')
    console.timeEnd('Buttons Loaded')
}

module.exports = { loadButtons }
