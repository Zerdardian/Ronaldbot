/** @format */

const Command = require("../structures/Command")
const Discord = require("Discord.js")
const config = require("../data/config.json")

// Clear tot een totaal van 100 messages.

module.exports = new Command({
    name: "clear",
    description: "Clear tot 100 messages in de chat!",
    type: "mod",
    permission: "MANAGE_MESSAGES",

    async run(message, args, client) {
        // Checken of het een nummer is of dat hij is gezet!
        const amount = args[1];
        if(!amount || isNaN(amount)) return message.reply(`${
            amount == undefined ? "'Nothing'" : amount} is niet een valid nummer!`);
        
        const amountParsed = parseInt(amount);
        // of het nummer meer dan 100 is
        if(amountParsed > 100) return message.reply(`Ik kan niet meer dan 100 messages verwijderen!`);
        message.channel.bulkDelete(amountParsed);
        const msg =  await message.channel.send(`Cleared ${amountParsed} messages!`);

        const botlogEmbed = new Discord.MessageEmbed()
                .setTitle('Bot log')
                .setDescription(`Er zijn messages verwijdered!`)
                .setFields(
                    {name: "Door", value: `${message.author.username} | <@${message.author.id}>`},
                    {name: "Totaal messages", value: `${amount}`},
                    {name: "In het volgende kanaal", value: `<#${message.channel.id}>`}
                )
        client.channels.cache.get(config["bot-logs-id"]).send({embeds: [botlogEmbed]})
        setTimeout(() => msg.delete(), 5000)
    }
})