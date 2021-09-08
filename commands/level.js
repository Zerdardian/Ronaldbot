/** @format */

const Client = require("../structures/Client.js")
const Command = require("../Structures/Command.js");
const mysql = require("mysql")
const config = require("../data/config.json")
const Discord = require("discord.js")
const fetch = require('node-fetch')

// Krijg je level!
module.exports = new Command({
	name: "level",
	description: "Krijg jouw xp/level te zien in de chat of die van een mede chatter!\n("+config.prefix+"level (optionele user))",
    type: "all",
    permission: "SEND_MESSAGES",

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

        // Al is de user mentioned!
        function getUserFromMention(mention) {
            if (!mention) return;
        
            if (mention.startsWith('<@') && mention.endsWith('>')) {
                mention = mention.slice(2, -1);
        
                if (mention.startsWith('!')) {
                    mention = mention.slice(1);
                }
        
                return client.users.cache.get(mention);
            }
        }

        const mentionUser = getUserFromMention(args[1]);

        // Al heb je niemand gementioned
        if(!mentionUser) {
            var idUser = message.author.id;
            var usernameUser = message.author.username
            var levelInfo = con.query(`SELECT * FROM levels WHERE userid = "${idUser}"`, function(err, result, fields) {
                if (err) throw err;

                var level = result[0].level;
                var xp = result[0].xp;
                var totalxp = result[0].totalxp;
                var nextLevelXp = ((level * 300) + (level * 10) * 1.4);
                if(nextLevelXp === 0) nextLevelXp = 100;

                const UserEmbed = new Discord.MessageEmbed()
                    .setColor('E0CBA8')
                    .setTitle('Level info')
                    .setThumbnail(message.author.avatarURL({ dynamic : true }))
                    .setURL(`${config.website}/user?id=${idUser}`)
                    .setAuthor(`${usernameUser} Level info`)
                    .addFields(
                        {name: "Level", value: `${level}`},
                        {name: "Totaal xp", value: `${totalxp}`},
                        {name: "Totaal nodig voor volgend level", value: `${xp}/${nextLevelXp}`}
                    )
                    .setTimestamp()
                    .setFooter(`${message.channel.guild} Levels`)

                message.reply({embeds: [UserEmbed]})
            })
        } else {
            var idUser = mentionUser.id
            if(idUser === config.botid) {
                message.reply("Ik ben een bot, ik kan level 999 zijn of level 0. Ik doe niet mee.")
            } else {
                var levelInfo = con.query(`SELECT * FROM levels WHERE userid = "${idUser}"`, function(err, result, fields) {
                    if (err) throw err;
                    if(levelInfo.length === 0) return message.reply(`<@${idUser}> bestaat nog niet. Waarschijnlijk zit hij niet op de server of heeft hij of zei nog niet gechat!`)
                    var level = result[0].level;
                    var xp = result[0].xp;
                    var totalxp = result[0].totalxp;
                    var nextLevelXp = ((level * 300) + (level * 10) * 1.4);
                    if(nextLevelXp === 0) nextLevelXp = 100;

                    const MentionEmbed = new Discord.MessageEmbed()
                        .setColor('E0CBA8')
                        .setTitle('Level info')
                        .setThumbnail(mentionUser.displayAvatarURL({ dynamic : true}))
                        .setURL(`${config.website}/user?id=${idUser}`)
                        .setAuthor(`${mentionUser.username}#${mentionUser.discriminator} Level info`)
                        .addFields(
                            {name: "Level", value: `${level}`},
                            {name: "Totaal xp", value: `${totalxp}`},
                            {name: "XP tot volgend level", value: `${xp}/${nextLevelXp}`}
                        )
                        .setTimestamp()
                        .setFooter(`${message.channel.guild} Levels`);

                message.reply({embeds: [MentionEmbed]})
                })  
            }
            
        }
	}
});