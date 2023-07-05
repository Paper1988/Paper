const { loadFiles } = require("../Functions/fileLoader");
const { Client } = require("discord.js");

/** 
 * @param {Client} client
 */
async function loadCommands(client) {
  console.time("Commands Loaded");
	const commands = new Array();

  await client.commands.clear();
	await client.subCommands.clear();

  let commandsArray = [];

  const Files = await loadFiles("Commands");

  Files.forEach((file) => {
		const command = require(file);
			
		if(command.subCommand)
			return client.subCommands.set(command.subCommand, command);
			
    client.commands.set(command.data.name, command);

    commandsArray.push(command.data.toJSON());

    commands.push({ Command: command.data.name, Status: "✅"});    
	});
	
	client.application.commands.set(commandsArray);
	
	console.table(commands, ["Command", "Status"]);
	console.info("\n\x1b[36m%s\x1b[0m", "Loaded Commands.");
	console.timeEnd("Commands Loaded");
}

module.exports = { loadCommands };