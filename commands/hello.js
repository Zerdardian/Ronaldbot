/** @format */

const Command = require("../Structures/Command.js");

// Begin command
module.exports = new Command({
	name: "hello",
	description: "Oh hallo!",
	type: "all",
	permission: "SEND_MESSAGES",

	async run(message, args, client) {
		message.reply("Oh hallo, sinds wanneer hebben we een interactie? Ik wist niet dat bots interactie kunnen hebben!");
	}
});
