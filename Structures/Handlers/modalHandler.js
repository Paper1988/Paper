const { loadFiles } = require("../Functions/fileLoader");

async function loadModals (client) {
    console.time("Modals Loaded");
    const modals = new Array();
    const Files = await loadFiles("Modals");

    Files.forEach(async (file) => {
        const modalFile = require(file);
        if (!modalFile.id) return;
        client.modals.set(modalFile.id, modalFile);
        modals.push({ Modals: modalFile.id, Status: "✅" });
    });

    console.table(modals, ["Modals", "Status"]);
    console.info("\n\x1b[36m%s\x1b[0m", "Loaded Modals.");
    console.timeEnd("Modals Loaded");
}

module.exports = { loadModals };