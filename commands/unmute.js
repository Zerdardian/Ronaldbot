/** @format */

const Command = require("../Structures/Command.js");
const Discord = require("discord.js")
const config = require("../data/config.json")

// wtf. waarom zou je iemand eerder unmuten, anyway.
// Unmute een user!
module.exports = new Command({
	name: "unmute",
	description: "Unmute een user die is gemute!",
    type: "mod",
	permission: "KICK_MEMBERS",

    async run(message, args, client) { 
        const errorEmbedNotFound = new Discord.MessageEmbed()
            .setTitle('Error, User niet gevonden')
            .setDescription('Deze user is niet gevonden, probeer het opnieuw!');

        const user = message.mentions.members.first() || message.guild.members.cache.get(args[1])
        if(user === undefined) return message.reply({embeds: [errorEmbedNotFound]})

        // Checken mute role
        let muteRole = message.guild.roles.cache.find(r => r.id === config["mute-role-id"]);
        if(!muteRole) return message.reply("Er is geen mute role set up!");
        
        if(user.roles.cache.has(`${config["mute-role-id"]}`)) {
            user.roles.remove(config["mute-role-id"])
            message.reply(`Hey <@${user.user.id}>, Je bent weer vrij om te chatten, je bent geunmute!`)
            client.channels.cache.get(config["bot-logs-id"]).send(`${user} Is geunmute door ${message.author}`)
        }
    }
})