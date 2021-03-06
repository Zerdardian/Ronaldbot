/** @format */

const Discord = require("discord.js");

const Command = require("./Command.js");

const config = require("../data/config.json")

const Event = require("./Event.js")

const intents = new Discord.Intents(32767);

const fs = require("fs");

class Client extends Discord.Client {
	constructor() {
		super({ intents });

		/**
		 * @type {Discord.Collection<string, Command>}
		 */
		this.commands = new Discord.Collection();

		this.prefix = config.prefix
	}

	start(token) {
		fs.readdirSync("./src/Commands")
			.filter(file => file.endsWith(".js"))
			.forEach(file => {
			/**
		 	* @type {Command}
		 	*/
				const command = require(`../Commands/${file}`);
				console.log(`(${file}) Command ${command.name} loaded`);
				this.commands.set(command.name, command);
		});
		fs.readdirSync("./src/Events")
			.filter(file => file.endsWith(".js"))
			.forEach(file => {
				/**
				 * @type {Event}
				 */
				const event = require(`../events/${file}`);
				console.log(`(${file}) Event with ${event.event} Loaded`)
				this.on(event.event, event.run.bind(null, this));
			})

		this.login(token)
	}
}

module.exports = Client;
