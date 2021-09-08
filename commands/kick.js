/** @format */

const Command = require("../Structures/Command.js");
const Discord = require("discord.js")
const mysql = require("mysql")
const config = require("../data/config.json")

// Kick een member van de server.

module.exports = new Command({
	name: "kick",
	description: "Kick een user van de Discord server! ("+config.prefix+"kick (user) (optionele reden))",
    type: "mod",
	permission: "KICK_MEMBERS",
	
	async run(message, args, client) {
        var con = mysql.createConnection({
            host: config.mysql[0],
            user: config.mysql[1],
            password: config.mysql[2],
            database: config.mysql[3]
        })
        // Database connection
        con.connect(function(err) {
            if(err) throw err;
        })

        const errorEmbedNotFound = new Discord.MessageEmbed()
            .setTitle('Error, User niet gevonden')
            .setDescription('Deze user is niet gevonden, probeer het opnieuw!');

        
        // Check of user bestaat!
		const user = message.mentions.users.first();
        if(user === undefined) return message.reply({embeds: [errorEmbedNotFound]})
        if(user.id === message.author.id) return message.reply("Helaas, ik kan je niet kicken. Maar wil je echt jezelf kicken?");
        if(user.id === config.botid) return message.reply("Je kunt de bot niet kicken! Maar haat je me zo erg?")

        // Reden
        let reason = args.slice(2).join(" ");
        if (!reason) reason = 'No Reason Given';

        const errorEmbedNoPermission = new Discord.MessageEmbed()
            .setTitle('Error, Geen permissies')
            .setDescription('Het kan zijn dat deze user een rank hoger is dan mij is of ik heb er geen permissie voor!')
        
        const KickedEmbed = new Discord.MessageEmbed()
            .setTitle(`Je bent gekicked van ${message.guild.name}`)
            .setDescription(`Beste ${user.username}`)
            .addFields(
                {name: "Je bent gekicked!", value: "Je bent gekicked van de Discord server wegens het volgende:"},
                {name: "Reden", value: `${reason}`},
                {name: "Door de volgende stafflid:", value: `${message.author.tag} | <@${message.author.id}>`},
                {name: "Contact", value: "Mocht jouw kick een fout zijn, laat het ons weten via onze website of via de Discord server. Je bent vrij om weer te joinen omdat het een Kick is geweest!"}
            )
            .setFooter(`Met vriendelijke groet, ${message.guild.name} Mod team.`)

        var member = message.mentions.members.first();
        
        const todayTime = new Date().getTime() + 7200000;
        const today = new Date(todayTime).toISOString().slice(0,19).replace("T", " ");

        con.query(`INSERT INTO punishments (userid, type, date, reason, modid) VALUES (${member.id}, 'kick', '${today}', '${reason}', ${message.author.id})`, function (err, result) {
            if(err) return console.log(err);
            member.send({embeds: [KickedEmbed]});

            const botlogEmbed = new Discord.MessageEmbed()
                .setTitle('Bot log')
                .setDescription(`Er is iemand uit de server geschopt!`)
                .setFields(
                    {name: "Door", value: `${message.author.username} | <@${message.author.id}>`},
                    {name: "Heeft de volgende user gekicked", value: `${user.username} | <@${user.id}>`},
                    {name: "Reden", value: `${reason}`},
                )
            setTimeout(() => {
                    if(member.kick()) return client.channels.cache.get(config["bot-logs-id"]).send({embeds: [botlogEmbed]})
        }, 100)
    });
	}
});