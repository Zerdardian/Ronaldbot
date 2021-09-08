const Event = require("../structures/Event.js")
const Discord = require("discord.js")
const mysql = require("mysql")
const config = require("../data/config.json")

// De counting bot.

// Checkt het nummer in het counting kanaal die is configurated via de config file.
// Al is het een nummer en het is het volgende nummer gaat hij door, zo niet. Dan faalt hij
// en moet je opnieuw beginnen, jammer man! ;)

module.exports = new Event("messageCreate", (client, message) => {
    // Database Info
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
    if (message.channel.id != config["counting-id"]) return;

    // if number
    if (!isNaN(message.content)) {
        // get current one
        con.query("SELECT * FROM `counting` WHERE `ruined` != 1", (err, result) => {
            if(err) throw err;

            // if empty and if number = 1
            if(result.length < 1 && message.content == 1) {
                con.query(`INSERT INTO counting (cur_number, latestuser) VALUES (1, ${message.author.id})`, (err, result) => {
                    if (err) throw err;

                    console.log("New counting created!")
                })
            } else {
                // Get the recent one!
                con.query("SELECT * FROM `counting` WHERE `ruined` != 1", (err, result) => {
                    if (err) throw err;

                    var getNewNumber = result[0]["cur_number"];
                    var newNumber = getNewNumber + 1;

                    var previousUser = result[0]["latestuser"];

                    if(message.author.id == previousUser) {
                        con.query("UPDATE counting SET ruined = 1 WHERE ruined != 1")
                        message.reply("Je praat zelf door, niet achter elkaar. Begin maar opnieuw!")
                        return;
                    }

                    if(message.content == newNumber) {
                        con.query(`UPDATE counting SET cur_number = ${newNumber}, latestuser = ${message.author.id} WHERE ruined != 1`)
                    } else {
                        con.query("UPDATE counting SET ruined = 1 WHERE ruined != 1")
                        message.reply("Helaas, je hebt het verkeerde nummer gebruikt of je hebt normaal zitten chatten. Begin opnieuw!")
                        return;
                    }
                })
            }
        })
    }
})