const Event = require("../structures/Event.js")
let blacklisted = require("../data/badwords.json")
const Discord = require("Discord.js")
const config = require("../data/config.json")

// Zelfde verhaal met de remove link!
// If bad word, remove it.
// Moet wel elke keer opnieuw opstarten, toekomstige ideratie add database!

module.exports = new Event("messageCreate", (client, message) => {
    const todayTime = new Date().getTime() + 7200000;
    const today = new Date(todayTime).toISOString().slice(0,19).replace("T", " ");
    let foundInText = false;
    for (var i in blacklisted) {
      if (message.content.toLowerCase().includes(blacklisted[i].toLowerCase())) foundInText = true;
    }
    if (foundInText) {
      message.delete();
      message.channel.send(`<@${message.author.id}>, Graag dit woord niet gebruiken!`)

      const botlogEmbed = new Discord.MessageEmbed()
        .setTitle('Bot log')
        .setFields(
          {name: "Message", value: `${message.content}`},
          {name: "Datum van schrijven", value: `${today}`},
          {name: "Gescreven door", value: `${message.author.username} | <@${message.author.id}>`}
        )

        client.channels.cache.get(config["bot-logs-id"]).send({embeds: [botlogEmbed]})
    }
})