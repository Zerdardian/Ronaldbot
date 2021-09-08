const Command = require("../Structures/Command.js");
const Discord = require("discord.js")
const config = require("../data/config.json")
const mysql = require("mysql")

// Tempmute een user voor een bepaalde tijd
module.exports = new Command({
	name: "tempmute",
	description: "Mute een user voor een gegeven bepaalde tijd!\n("+config.prefix+"tempmute (user) (tijd in s/seconde (60s max)| m/minuten (60m max)| h/uren (24h max)| d/dagen (30d max)) (Optionele reden!) | Let op, kies 1 tijd!)",
    type: "mod",
	permission: "KICK_MEMBERS",
	
	async run(message, args, client) {
        // Main command Tempmute

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
        const errorEmbedNoTimeGiven = new Discord.MessageEmbed()
            .setTitle('Error, Geen tijd gegeven')
            .setDescription('Er is geen tijd op gegeven! Probeer het opnieuw!');

        const user = message.mentions.members.first() || message.guild.members.cache.get(args[1])
        if(user === undefined) return message.reply({embeds: [errorEmbedNotFound]})

        const amount = args[2];

        const today = new Date().toISOString().slice(0,19).replace("T", " ");

        if(amount === undefined) return message.reply({embeds: [errorEmbedNoTimeGiven]})
        if(amount.includes("d") | amount.includes("D") | amount.includes("h") | amount.includes("H") | amount.includes("m") | amount.includes("M") | amount.includes("s") | amount.includes("S")) {
            // Dagen
            if(amount.includes("d") | amount.includes("D")) {
                if(amount.includes("d")) {
                    var str = amount;
                    newStr = str.replace('d', '')
                } else {
                    var str = amount;
                    newStr = str.replace('D', '')
                }
                var intStr = parseInt(newStr);
                if(intStr > 30) return message.reply("Je kunt niet meer dan 30 dagen doen om iemand te muten!")
                
                var timePunishmentTime = new Date().getTime() + (intStr * 24 * 60 * 60 * 1000) + 7200000;
                var timePunishment = new Date(timePunishmentTime)

                var timeoutTime = intStr * 24 * 60 * 60 * 1000;
            // Uren
            } else if(amount.includes("h") | amount.includes("H")) {
                if(amount.includes("h")) {
                    var str = amount;
                    newStr = str.replace('h', '')
                } else {
                    var str = amount;
                    newStr = str.replace('H', '')
                }
                var intStr = parseInt(newStr);
                if(intStr > 24) return message.reply("Je kunt niet meer dan 24 uur muten. Gebruik dan dagen!")
                
                var timePunishmentTime = new Date().getTime() + + (intStr * 60 * 60 * 1000) + 7200000;
                var timePunishment = new Date(timePunishmentTime)

                var timeoutTime = intStr * 60 * 60 * 1000;
            // Minuten
            } else if(amount.includes("m") | amount.includes("M")) {
                if(amount.includes("m")) {
                    var str = amount;
                    newStr = str.replace('m', '')
                } else {
                    var str = amount;
                    newStr = str.replace('M', '')
                }
                var intStr = parseInt(newStr);
                if(intStr > 60) return message.reply("Je kunt niet meer dan 60 minuten muten! Gebruik dan uren!")
                
                var timePunishmentTime = new Date().getTime() + + (intStr * 60 * 1000) + 7200000;
                var timePunishment = new Date(timePunishmentTime)

                var timeoutTime = intStr * 60 * 1000;
            } else {
                if(amount.includes("s") | amount.includes("S")) {
                    var str = amount;
                    newStr = str.replace('s', '')
                } else {
                    var str = amount;
                    newStr = str.replace('S', '')
                }
                var intStr = parseInt(newStr);
                if(intStr > 60) return message.reply("Je kunt niet meer dan 60 seconde muten via de 's'!")
                
                var timePunishmentTime = new Date().getTime() + (intStr * 1000) + 7200000;
                var timePunishment = new Date(timePunishmentTime)

                var timeoutTime = intStr * 1000;
            }
        } else {
            return message.reply("Je moet een geldige tijd opgeven!")
        }

        let reason = args.slice(3).join(" ");
        if (!reason) reason = 'No Reason Given';

        // Als beide niet zijn gezet.
        if(!timePunishment | !timeoutTime) return message.reply("Er is iets mis gegaan, probeer het opnieuw!");
        // Timepunishment to iso voor db
        var until = timePunishment.toISOString().slice(0,19).replace("T", " ")

        // Checken mute role
        let muteRole = message.guild.roles.cache.find(r => r.id === config["mute-role-id"]);
        if(!muteRole) return message.reply("Er is geen mute role set up!");
        
        if(user.roles.cache.has(`${config["mute-role-id"]}`)) return message.reply("User is al muted!")
        
        const MutedEmbed = new Discord.MessageEmbed()
            .setTitle(`Je bent Gemute op ${message.guild.name}`)
            .setDescription(`Beste ${user.username}`)
            .addFields(
                {name: "Je bent gemute!", value: `Je bent gemute tot ${until} wegens het volgende!`},
                {name: "Reden", value: `${reason}`},
                {name: "Door de volgende stafflid:", value: `${message.author.tag} | <@${message.author.id}>`},
                {name: "Contact", value: "Mocht jouw mute onterecht zijn, kan je een unmute aanvragen via de Website!"}
            )
            .setFooter(`Met vriendelijke groet, ${message.guild.name} Mod team.`)

        // INSERT BABY!
        con.query(`INSERT INTO punishments (userid, type, date, until, reason, modid) VALUES (${user.id}, 'temporal mute', '${today}', '${until}', '${reason}', ${message.author.id})`, function (err, result) {
            if (err) return console.log(err);

            user.roles.add(config["mute-role-id"])
            user.send({embeds: [MutedEmbed]})

            const botlogEmbed = new Discord.MessageEmbed()
                .setTitle('Bot log')
                .setDescription(`Er is een mute geplaats op iemand!`)
                .setFields(
                    {name: "Door", value: `${message.author.username} | <@${message.author.id}>`},
                    {name: "Mute op de volgende user", value: `${user.user.username} | <@${user.id}>`},
                    {name: "Reden", value: `${reason}`},
                    {name: "Tot en met", value: `${until}`}
                )
            client.channels.cache.get(config["bot-logs-id"]).send({embeds: [botlogEmbed]})

            // Timeout voor de bot
            setTimeout(() => {
                if(!user.roles.cache.has(`${config["mute-role-id"]}`)) return;

                user.roles.remove(config["mute-role-id"])
                client.channels.cache.get(config["bot-logs-id"]).send(`<@${user.user.username}> Is zojuist geunmute omdat zijn tijd er op zit!`)
            }, timeoutTime);
        });
	}
});