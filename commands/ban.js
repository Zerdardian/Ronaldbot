/** @format */

const Command = require("../Structures/Command.js");
const Discord = require("discord.js")
const mysql = require("mysql")
const config = require("../data/config.json")

// Ban een user voor een onbepaalde tijd!
// Simpel als dat!


module.exports = new Command({
	name: "ban",
	description: "Ban een user voor het rejoinen van de server! (" + config.prefix + "ban (user))",
    type: "mod",
	permission: "BAN_MEMBERS",
	
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

        // Check of de user bestaat, zo niet krijg een error. Je kan jezelf niet bannen en niet de bot.
		const user = message.mentions.users.first();
        if(user === undefined) return message.reply({embeds: [errorEmbedNotFound]})
        if(user.id === message.author.id) return message.reply("Wil je echt jezelf bannen?");
        if(user.id === config.botid) return message.reply("Je kunt de bot niet bannen! Maar haat je me zo erg?")

        // Checken voor reden
        let reason = args.slice(2).join(" ");
        if (!reason) reason = 'No Reason Given';

        const errorEmbedNoPermission = new Discord.MessageEmbed()
            .setTitle('Error, Geen permissies')
            .setDescription('Het kan zijn dat deze user een rank hoger is dan mij is of ik heb er geen permissie voor!')
        
        const BannedEmbed = new Discord.MessageEmbed()
            .setTitle(`Je bent verbannen van ${message.guild.name}`)
            .setDescription(`Beste ${user.username}`)
            .addFields(
                {name: "Je bent verbannen!", value: "Je bent verbannen van de Discord server wegens het volgende:"},
                {name: "Reden", value: `${reason}`},
                {name: "Door de volgende mod:", value: `${message.author.tag} | <@${message.author.id}>`},
                {name: "Contact", value: "Mocht jouw ban een fout zijn, laat het ons weten via onze website"}
            )
            .setFooter(`Met vriendelijke groet, ${message.guild.name} Mod team.`)

        // Easy way to get member object though mentions.
        var member = message.mentions.members.first();
        const todayTime = new Date().getTime() + 7200000;
        const today = new Date(todayTime).toISOString().slice(0,19).replace("T", " ");
        // ban
        con.query(`INSERT INTO punishments (userid, type, date, reason, modid) VALUES (${member.id}, 'ban', '${today}', '${reason}', ${message.author.id})`, function (err, result) {
            if(err) return console.log(err);
            member.send({embeds: [BannedEmbed]});

            const botlogEmbed = new Discord.MessageEmbed()
                .setTitle('Bot log')
                .setDescription(`Er is een member verbannen door <@${message.author.id}>`)
                .setFields(
                    {name: "Member verbannen", value: `${user.username} | <@${user.id}>`},
                    {name: "Datum van Ban", value: `${today}`},
                    {name: "Reden van ban", value: `${reason}`}
                )
            
                // Eerst de message, daarna de ban!
            setTimeout(() => {
                if(member.ban()) return client.channels.cache.get(config["bot-logs-id"]).send({embeds: [botlogEmbed]})

            }, 1000)
        });
	}
});