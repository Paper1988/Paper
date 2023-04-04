async function loadEvents(client) {
	const ascii = require("ascii-table");
	const { loadFiles } = require("../Functions/fileLoader.js");
	const table = new ascii().setHeading("Events", "Status");

	await client.events.clear();

	const Files = await loadFiles("Events");
	Files.forEach((file) => {
		const event = require(file);

		const execute = (...args) => event.execute(...args, client);

		client.events.set(event.name, execute);

		if(event.rest) {
			if(event.once) client.rest.on(event.name, execute);
			else
				client.rest.on(event.name, execute);
		} else {
			if (event.once) client.once(event.name, execute);
			else
				client.on(event.name, execute);
		}

		table.addRow(event.name, "🔰")
	})
	return console.log(table.toString(), "\n✅ >>> Events已載入");
}

module.exports = { loadEvents };