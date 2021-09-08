/** @format */

const Command = require("../Structures/Command.js");
const Discord = require("discord.js")
const mysql = require("mysql")
const config = require("../data/config.json")

// Ban een user voor een onbepaalde tijd!
module.exports = new Command({
    name: "tempban",
    description: "Verwijder een gebruiker tijdelijk van het joinen van de server!\n("+config.prefix+"tempban (user) (tijd in s/seconde (60s max)| m/minuten (60m max)| h/uren (24h max)| d/dagen (30d max)) (Optionele reden!) | Let op, kies 1 tijd!)",
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
        con.connect(function (err) {
            if (err) throw err;
        })

        const errorEmbedNotFound = new Discord.MessageEmbed()
            .setTitle('Error, User niet gevonden')
            .setDescription('Deze user is niet gevonden, probeer het opnieuw!');

        const user = message.mentions.users.first();
        var member = message.mentions.members.first();
        if (user === undefined) return message.reply({
            embeds: [errorEmbedNotFound]
        })
        if (user.id === message.author.id) return message.reply("Wil je echt jezelf bannen?");
        if (user.id === config.botid) return message.reply("Je kunt de bot niet bannen! Maar haat je me zo erg?")

        const amount = args[2];

        if (amount.includes("d") | amount.includes("D") | amount.includes("h") | amount.includes("H") | amount.includes("m") | amount.includes("M") | amount.includes("s") | amount.includes("S")) {
            // Dagen
            if (amount.includes("d") | amount.includes("D")) {
                if (amount.includes("d")) {
                    var str = amount;
                    newStr = str.replace('d', '')
                } else {
                    var str = amount;
                    newStr = str.replace('D', '')
                }
                var intStr = parseInt(newStr);
                if (intStr > 30) return message.reply("Je kunt niet meer dan 30 dagen doen om iemand te Bannen!")

                var timePunishmentTime = new Date().getTime() + (intStr * 24 * 60 * 60 * 1000) + 7200000;
                var timePunishment = new Date(timePunishmentTime)

                var timeoutTime = intStr * 24 * 60 * 60 * 1000;
                // Uren
            } else if (amount.includes("h") | amount.includes("H")) {
                if (amount.includes("h")) {
                    var str = amount;
                    newStr = str.replace('h', '')
                } else {
                    var str = amount;
                    newStr = str.replace('H', '')
                }
                var intStr = parseInt(newStr);
                if (intStr > 24) return message.reply("Je kunt niet meer dan 24 uur Bannen. Gebruik dan dagen!")

                var timePunishmentTime = new Date().getTime() + +(intStr * 60 * 60 * 1000) + 7200000;
                var timePunishment = new Date(timePunishmentTime)

                var timeoutTime = intStr * 60 * 60 * 1000;
                // Minuten
            } else if (amount.includes("m") | amount.includes("M")) {
                if (amount.includes("m")) {
                    var str = amount;
                    newStr = str.replace('m', '')
                } else {
                    var str = amount;
                    newStr = str.replace('M', '')
                }
                var intStr = parseInt(newStr);
                if (intStr > 60) return message.reply("Je kunt niet meer dan 60 minuten bannen! Gebruik dan uren!")

                var timePunishmentTime = new Date().getTime() + +(intStr * 60 * 1000) + 7200000;
                var timePunishment = new Date(timePunishmentTime)

                var timeoutTime = intStr * 60 * 1000;
            } else {
                if (amount.includes("s") | amount.includes("S")) {
                    var str = amount;
                    newStr = str.replace('s', '')
                } else {
                    var str = amount;
                    newStr = str.replace('S', '')
                }
                var intStr = parseInt(newStr);
                if (intStr > 60) return message.reply("Je kunt niet meer dan 60 seconde bannen! Waarom in seconde tho?")

                var timePunishmentTime = new Date().getTime() + (intStr * 1000) + 7200000;
                var timePunishment = new Date(timePunishmentTime)

                var timeoutTime = intStr * 1000;
            }
        } else {
            return message.reply("Je moet een geldige tijd opgeven!")
        }

        var until = timePunishment.toISOString().slice(0, 19).replace("T", " ")

        let reason = args.slice(3).join(" ") + ` - Tot ${until}`;
        if (!reason) reason = `Er is geen reden opgegeven - tot ${until}`;

        const todayTime = new Date().getTime() + 7200000;
        const today = new Date(todayTime).toISOString().slice(0,19).replace("T", " ");

        const BannedEmbed = new Discord.MessageEmbed()
            .setTitle(`Je bent Verbannen van ${message.guild.name}`)
            .setDescription(`Beste ${user.username}`)
            .addFields({
                name: "Je bent verbannen!",
                value: `Je bent verbannen tot ${until} van de Discord server.`
            }, {
                name: "Reden",
                value: `${reason}`
            }, {
                name: "Door de volgende stafflid:",
                value: `${message.author.tag} | <@${message.author.id}>`
            }, {
                name: "Contact",
                value: "Mocht jouw ban onterecht zijn, laat het ons weten via onze website. Je kunt de Discord server weer joinen na jouw punishment!"
            })
            .setFooter(`Met vriendelijke groet, ${message.guild.name} Mod team.`);


        con.query(`INSERT INTO punishments (userid, type, date, until, reason, modid) VALUES (${user.id}, 'Temporal ban', '${today}', '${until}', '${reason}', ${message.author.id})`, function (err, result) {
            user.send({
                embeds: [BannedEmbed]
            })

            const botlogEmbed = new Discord.MessageEmbed()
                .setTitle('Bot log')
                .setDescription(`Er is een Ban geplaats op iemand!`)
                .setFields({
                    name: "Door",
                    value: `${message.author.username} | <@${message.author.id}>`
                }, {
                    name: "Ban op de volgende user",
                    value: `${user.username} | <@${user.id}>`
                }, {
                    name: "Reden",
                    value: `${reason}`
                }, {
                    name: "Tot en met",
                    value: `${until}`
                });

                setTimeout(() => {
                    if (member.ban({reason: `${reason}`})) {
                        client.channels.cache.get(config["bot-logs-id"]).send({
                            embeds: [botlogEmbed]
                        })

                        setTimeout(() => {
                            message.guild.members.unban(`${user.id}`, `Temporal ban expired!`);
                            client.channels.cache.get(config["bot-logs-id"]).send(`Temporal ban expired from ${user}`)
                        }, timeoutTime); 
                
                    }
                }, 1000);
        })
    }
})