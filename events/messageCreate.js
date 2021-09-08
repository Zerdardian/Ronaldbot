const Event = require("../structures/Event.js")

// Command related

module.exports = new Event("messageCreate", (client, message) => {
    // If its the bot return
	if (message.author.bot) return;

	// if doesn't start with prefix return.
	if (!message.content.startsWith(client.prefix)) return;

	// Checking arcs
	const args = message.content.substring(client.prefix.length).split(/ +/);

	// If it is a command in de map.
	const command = client.commands.find(cmd => cmd.name == args[0]);

	// If it isn't a command, mag uit al moet het. moet alleen de message.reply gone.
	if (!command) return message.reply(`De command ${args[0]} bestaat niet. Maybe for the best, maybe for the worst...`);

	// Checken voor permissies
	const permission = message.member.permissions.has(command.permission);

	// Als je NIET de permissie hebt via de ranking van discord zelf, sommige commands doen dat anders.
	if (!permission) return message.reply(`Je hebt geen recht om deze command te gebruiken!`)

	// Run the command!
	command.run(message, args, client);
})