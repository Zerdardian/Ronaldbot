/** @format */

const Discord = require("discord.js")
const config = require("../data/config.json")
const Command = require("../Structures/Command.js");

// Help command, voor het krijgen van alle commands

module.exports = new Command({
    name: "help",
    description: "Krijg de commandlijst in DM met hun functionaliteiten!",
    type: "all",
    permission: "SEND_MESSAGES",

    async run(message, args, client) {
        // Commands in general
        const commands = client.commands;
        // Define command types
        const AllCommands = [];
        const modCommands = [];
        const unsortedCommands = [];

        commands.forEach(command => {
            switch(command.type) {
                case "all":
                    AllCommands.push(command) 
                    return;
                case "mod": 
                    modCommands.push(command)
                    return;
                default: 
                    unsortedCommands.push(command)
                    return;
            }
        });

        const embed = new Discord.MessageEmbed()
            .setTitle('!Help command')
            .addFields({
                name: "Commands voor allen!",
                value: AllCommands.map(command => "** - " + command.name + "**\n" + command.description).sort().join(`\n`),
                }, {
                    name: "Mod commands!",
                    value: modCommands.map(command => "** - " + command.name + "**\n" + command.description).sort().join(`\n`) + ("\n**Let op** dat je bij de mod commands een staff rank nodig hebt!"),
                }, {
                    name: "Unsorted Commands!",
                    value: unsortedCommands.map(command => "** - " + command.name + " (" + command.type + ")**\n" + command.description).sort().join(`\n`) + ("\n**Let op** dat je misschien voor sommige commands geen permissie hebt!"),
                })

        return message.author.send({
                embeds: [embed]
            })
            .then(() => {
                if (message.channel.type === 'dm') return;
                message.channel.send(`Er is een privebericht verzonden!, ${message.author}.`);
            })
            .catch(error => {
                console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                message.channel.send(`Woops, ik kan jou geen dm sturen... ${message.author}`);
            });
    }
});