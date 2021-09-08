/** @format */

const Command = require("../Structures/Command.js");
const Discord = require("discord.js")
const config = require("../data/config.json")
const mysql = require("mysql")

// Mute een user voor een onbepaalde tijd!
module.exports = new Command({
	name: "mute",
	description: "Mute een member voor een onbepaalde tijd!\n("+config.prefix+"mute (user) (reden))",
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

        const user = message.mentions.members.first() || message.guild.members.cache.get(args[1])
        if(user === undefined) return message.reply({embeds: [errorEmbedNotFound]})

        let reason = args.slice(2).join(" ");
        if (!reason) reason = 'No Reason Given';
        const todayTime = new Date().getTime() + 7200000;
        const today = new Date(todayTime).toISOString().slice(0,19).replace("T", " ");

        // Checken mute role
        let muteRole = message.guild.roles.cache.find(r => r.id === config["mute-role-id"]);
        if(!muteRole) return message.reply("Er is geen mute role set up!");
        
        if(user.roles.cache.has(`${config["mute-role-id"]}`)) return message.reply("Deze user is al muted!")

        const MutedEmbed = new Discord.MessageEmbed()
            .setTitle(`Je bent Gemute op ${message.guild.name}`)
            .setDescription(`Beste ${user.username}`)
            .addFields(
                {name: "Je bent gemute!", value: `Je bent gemute vanwege het volgende!`},
                {name: "Reden", value: `${reason}`},
                {name: "Door de volgende stafflid:", value: `${message.author.tag} | <@${message.author.id}>`},
                {name: "Contact", value: "Mocht jouw mute onterecht zijn, kan je een unmute aanvragen via de Website!"}
            )
            .setFooter(`Met vriendelijke groet, ${message.guild.name} Mod team.`)

        con.query(`INSERT INTO punishments (userid, type, date, reason, modid) VALUES (${user.id}, 'mute', '${today}', '${reason}', ${message.author.id})`, function (err, result) {
            if (err) return console.log(err);

            user.roles.add(config["mute-role-id"])
            user.send({embeds: [MutedEmbed]})
            const botlogEmbed = new Discord.MessageEmbed()
                .setTitle('Bot log')
                .setDescription(`Er is een mute geplaats op iemand!`)
                .setFields(
                    {name: "Door", value: `${message.author.username} | <@${message.author.id}>`},
                    {name: "Mute op de volgende user", value: `${user.username} | <@${user.id}>`},
                    {name: "Reden", value: `${reason}`}
                )
            client.channels.cache.get(config["bot-logs-id"]).send({embeds: [botlogEmbed]})
        });
    }
})