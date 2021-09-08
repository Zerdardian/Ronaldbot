/** @format */

const Command = require("../Structures/Command.js");
const mysql = require("mysql")
const Discord = require("discord.js")

module.exports = new Command({
	name: "leaderboard",
	description: "Krijg de top 10 xp leaders in de chat!",
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

		// Leaderboard, zorg dat er 10 mensen zijn, genoeg errors.
        con.query(`SELECT * FROM levels ORDER BY totalxp DESC LIMIT 10`, function (err, result, fields) {
			if(err) return message.reply("Er is een error ontstaan! Mocht deze error blijven spelen, ping 1 van de developers!")
			const embed = new Discord.MessageEmbed()
				.setTitle("Leaderboard")
				.setDescription("Zie hier de top 10")
				.setFields(
					{
						name: `#1 ${result[0].username}`,
						value: `Level ${result[0].level} - Totaal xp ${result[0].totalxp}`
					},
					{
						name: `#2 ${result[1].username}`,
						value: `Level ${result[1].level} - Totaal xp ${result[1].totalxp}`
					},
					{
						name: `#3 ${result[2].username}`,
						value: `Level ${result[2].level} - Totaal xp ${result[2].totalxp}`
					},
					{
						name: `#4 ${result[3].username}`,
						value: `Level ${result[3].level} - Totaal xp ${result[3].totalxp}`
					},
					{
						name: `#5 ${result[4].username}`,
						value: `Level ${result[4].level} - Totaal xp ${result[4].totalxp}`
					},
					{
						name: `#6 ${result[5].username}`,
						value: `Level ${result[5].level} - Totaal xp ${result[5].totalxp}`
					},
					{
						name: `#7 ${result[6].username}`,
						value: `Level ${result[6].level} - Totaal xp ${result[6].totalxp}`
					},
					{
						name: `#8 ${result[7].username}`,
						value: `Level ${result[7].level} - Totaal xp ${result[7].totalxp}`
					},
					{
						name: `#9 ${result[8].username}`,
						value: `Level ${result[8].level} - Totaal xp ${result[8].totalxp}`
					},
					{
						name: `#10 ${result[9].username}`,
						value: `Level ${result[9].level} - Totaal xp ${result[9].totalxp}`
					}
				)
				.setFooter('Voor meer, zie de website!')
			
			message.reply({embeds: [embed]}).catch((err) => {
				return console.log(err)
			})
		})
	}
});