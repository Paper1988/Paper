const { loadFiles } = require("../Functions/fileLoader");

async function loadCommands(client) {
  console.time("Commands Loaded");
	const commands = new Array();

  await client.commands.clear();

  let commandsArray = [];

  const files = await loadFiles("Commands");

  for (const file of files) {
    try {
      const command = require(file);
      client.commands.set(command.data.name, command);

      commandsArray.push(command.data.toJSON());

      commands.push({ Command: command.data.name, Status: "✅"});
    } catch (error) {
      commands.push({ Command: file.split("/").pop().slice(0, -3), Status: "🛑"});
    }

    client.application.commands.set(commandsArray);
  }

	console.table(commands, ["Command", "Status"]);
	console.info("\n\x1b[36m%s\x1b[0m", "Loaded Commands.");
	console.timeEnd("Commands Loaded");
}

module.exports = { loadCommands };