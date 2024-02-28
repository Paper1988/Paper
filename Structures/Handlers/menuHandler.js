const { loadFiles } = require("../Functions/fileLoader");

async function loadMenus (client) {
    console.time("Menus Loaded");
    const menus = new Array();
    const Files = await loadFiles("Menus");

    Files.forEach(async (file) => {
        const menuFile = require(file);
        if (!menuFile.id) return;
        client.selectMenus.set(menuFile.id, menuFile);
        menus.push({ Menus: menuFile.id, Status: "✅" });
    });

    console.table(menus, ["Menus", "Status"]);
    console.info("\n\x1b[36m%s\x1b[0m", "Loaded Menus.");
    console.timeEnd("Menus Loaded");
}

module.exports = { loadMenus };