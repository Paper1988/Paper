// programmed by bastian-js
// https://github.com/bastian-js/
// https://github.com/bastian-js/discord-anticrash-v13v14

const { Client, EmbedBuilder, WebhookClient } = require("discord.js");
const { inspect } = require("util");
const webhook = new WebhookClient({
	url: "https://discord.com/api/webhooks/967768559688249344/dp6yrq5Jw4boYyZiS6NBhS3hGKIP_lTL7uP6DDYNr-XrJL6T5Gy0_smg5lcoZsvAu5EB",
});

/**
 * 
 * @param {Client} client 
 */
module.exports = (client) => {
	const embed = new EmbedBuilder().setColor("Red");

	client.on("error", (err) => {
		console.log(err);

		embed
			.setTitle("Discord API Error")
			.setURL("https://discordjs.guide/popular-topics/errors.html#api-errors")
			.setDescription(
				`\`\`\`${inspect(err, { depth: 0 }).slice(0, 1000)}\`\`\``
			)
			.setTimestamp();

		return webhook.send({ embeds: [embed] });
	});

	process.on("unhandledRejection", (reason, promise) => {
		console.log(reason, "\n", promise);

		embed
			.setTitle("Unhandled Rejection/Catch")
			.setURL("https://nodejs.org/api/process.html#event-unhandledrejection")
			.addFields(
				{
					name: "Reason",
					value: `\`\`\`${inspect(reason, { depth: 0 }).slice(0, 1000)}\`\`\``,
				},
				{
					name: "Promise",
					value: `\`\`\`${inspect(promise, { depth: 0 }).slice(0, 1000)}\`\`\``,
				}
			)
			.setTimestamp();

		return webhook.send({ embeds: [embed] });
	});

	process.on("uncaughtException", (err, origin) => {
		console.log(err, "\n", origin);

		embed
			.setTitle("Uncaught Exception/Catch")
			.setURL("https://nodejs.org/api/process.html#event-uncaughtexception")
			.addFields(
				{
					name: "Error",
					value: `\`\`\`${inspect(err, { depth: 0 }).slice(0, 1000)}\`\`\``,
				},
				{
					name: "Origin",
					value: `\`\`\`${inspect(origin, { depth: 0 }).slice(0, 1000)}\`\`\``,
				}
			)
			.setTimestamp();

		return webhook.send({ embeds: [embed] });
	});

	process.on("uncaughtExceptionMonitor", (err, origin) => {
		console.log(err, "\n", origin);

		embed
			.setTitle("Uncaught Exception Monitor")
			.setURL(
				"https://nodejs.org/api/process.html#event-uncaughtexceptionmonitor"
			)
			.addFields(
				{
					name: "Error",
					value: `\`\`\`${inspect(err, { depth: 0 }).slice(0, 1000)}\`\`\``,
				},
				{
					name: "Origin",
					value: `\`\`\`${inspect(origin, { depth: 0 }).slice(0, 1000)}\`\`\``,
				}
			)
			.setTimestamp();

		return webhook.send({ embeds: [embed] });
	});

	process.on("warning", (warn) => {
		console.log(warn);

		embed
			.setTitle("Uncaught Exception Monitor Warning")
			.setURL("https://nodejs.org/api/process.html#event-warning")
			.addFields({
				name: "Warning",
				value: `\`\`\`${inspect(warn, { depth: 0 }).slice(0, 1000)}\`\`\``,
			})
			.setTimestamp();

		return webhook.send({ embeds: [embed] });
	});
};