const Event = require("../structures/Event.js")
const Client = require("../structures/Client.js")
const config = require("../data/config.json")
const Discord = require("discord.js")
const mysql = require("mysql");
const fs = require("fs");
const cooldowns = new Set()

// Add xp - Het xp systeem
// Xp wordt elke 60 seconde toegevoegd na een message create event.
// 
// User wordt opgeslagen in cooldowns en wordt gekeken of die user al heeft gechat in de 60 seconde.
// Daarna wordt een random nummer geadd aan hun level/xp

module.exports = new Event("messageCreate", (client, message) => {
    // Database Info
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
    // Get id info of message
    var idUser = message.author.id;
    var username = message.author.username;

    // If isn't equal from the bot
    if(idUser != 534832630328197121) {
        // First time checking
        console.log(cooldowns)
        if (cooldowns.has(message.author.id)) return;
        cooldowns.add(message.author.id);
        setTimeout(() => cooldowns.delete(message.author.id), 60000)

        var levelInfo = con.query(`SELECT * FROM levels WHERE userid = "${idUser}"`, function(err, result, fields) {
            if (err) throw err;
            
            // If you don't exsist
            if(result.length === 0) {
                con.query(`INSERT INTO levels (userid, username, level, xp, totalxp) VALUES (${idUser}, '${message.member.user.tag}', 0, 0, 0)`, function (err, result) {
                    if(err) throw err;
                    console.log(`${idUser} is now added!`)
                })
            }

            // Get level
            var levelUser = result[0].level;
            // Get (CURRENT LEVEL) xp
            var xpUser = result[0].xp;
            // Get total xp
            var xpTotalUser = result[0].totalxp;
            // Random xp
            var randomXp = Math.floor(Math.random(1) * 25);
            
            // Next level xp
            var nextLevelXp = ((levelUser * 300) + (levelUser * 10) * 1.4);
            if(nextLevelXp === 0) nextLevelXp = 100;
    
            // Level xp for chatting
            var newXp = xpUser + randomXp;

            // New total xp for chatting
            var newTotalXp = xpTotalUser + randomXp;

            // Set level en xp
            con.query(`UPDATE levels SET xp = ${newXp}, totalxp = ${newTotalXp}, username = '${message.member.user.tag}' WHERE userid = ${idUser}`, function(err, result) {
                if(err) throw err;
    
                con.query(`SELECT * FROM levels WHERE userid = ${idUser}`, function(err, result) {
                    if(err) throw err;
                    var getNewXpUser = result[0].xp;
                    if(getNewXpUser >= nextLevelXp) {
                        var newLevel = levelUser + 1;
    
                        con.query(`UPDATE levels SET xp = 0, level = ${newLevel} WHERE userid = ${idUser}`, function(err, result) {
                            if(err) throw err;
    
                            con.query(`SELECT * FROM levels WHERE userid = ${idUser}`, function(err, result) {
                                if(err) throw err;
                                           
                                message.channel.send(`Level up! ${username} is zojuist level ${result[0].level} geworden!`);
                                });
                            })
                        }
                    })
            });
        })
    }
})
