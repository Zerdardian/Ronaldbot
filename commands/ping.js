/** @format */

const Command = require("../Structures/Command.js");

module.exports = new Command({
	name: "ping",
	description: "Krijg de ping van de bot hoesnel ik reageer! (nee geen pingpong, ik heb al een gouden medal.)",
	type:"all",
	permission: "SEND_MESSAGES",
	
	async run(message, args, client) {
		const msg = await message.reply(`Ping: ${client.ws.ping} ms.`);

		msg.edit(
			`Ping: ${client.ws.ping} ms.\nMessage Ping: ${
				msg.createdTimestamp - message.createdTimestamp
			}`
		);
	}
});