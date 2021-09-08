/** @format */

const Command = require("../structures/Command")
const Discord = require("Discord.js")
const config = require("../data/config.json")

// Eventw command, voor het adden en removen van de event winnaar rank!
module.exports = new Command({
    name: "eventw",
    description: "Add de eventwinnaar rank aan een member bij het winnen van een event!\n("+ config.prefix+"eventw (add/remove) (user))",
    type: "Event Team",
    permission: "SEND_MESSAGES",

    async run(message, args, client) {
        // Data
        const type = args[1];
        const user = message.mentions.members.first() || message.guild.members.cache.get(args[2]);

        // Hebben we de rollen
        const eventRole = config["event-team-role-id"];
        const eventWinner = config["event-winner-id"];

        let EventCheckRole = message.guild.roles.cache.some(role => role.id === eventRole);
        let EventWinnerCheckRole = message.guild.roles.cache.some(role => role.id === eventWinner);

        // Hebben we beide rollen?
        if(EventCheckRole == false || EventWinnerCheckRole == false) return message.reply("Sommige ranks zijn niet gemaakt of de rank-id staat nog niet in de config, vraag de developers of ze die er bij kunnen zetten!");        
        if(user == undefined) return message.reply("Je hebt er geen user bij getagged of het id klopt niet! Probeer het opnieuw!") 

        // WINNER WINNER CHICKEN DINNER EMBED
        const winnerEmbed = new Discord.MessageEmbed()
            .setTitle("Gefeliciteerd!")
            .setDescription(`Gefeliciteerd ${user.user}, Je hebt zojuist de Event winnaar rank gekregen!`)
            .addFields({
                name: "Wat betekent dit?",
                value: "Je hebt zojuist de event winnaar rank gekregen omdat je een evenement hebt gewonnen of iets heb gedaan binnen een evenement op de server! Deze rank is niet permanent maar geeft je wat extra fame op de member list!"
            }, {
                name: "Wanneer wordt de rank verwijderd?",
                value: "De event winnaar rank blijft bij jou tot een volgend evenement of tot een gegeven bepaalde tijd. Mocht je nog een vraagje hebben. Kun je ze altijd stellen!\nWe zijn elkaar bij het volgende evenement!\n\nMet vriendelijke groet,\n Het evenement team!"
            })

        // RANK REMOVE EMBED (take the l)
        const removeEmbed = new Discord.MessageEmbed()
            .setTitle("Bedankt voor het spelen!")
            .setDescription(`Bedankt voor het spelen bij 1 van onze evenementen ${user.user}. Omdat er een nieuw evenement aan komt of omdat we tegen een bepaalde tijd zitten, is de rank van je weg gehaald!`)
            .setFields({
                name: "Kan ik hem nog terug krijgen?",
                value: "Ja, je kan hem nog terug krijgen door mee te doen met 1 van onze evenementen!"
            }, {
                name: "Dat was hem dan!",
                value: "We zien elkaar bij een volgend evenement! Tot de volgende!\n\nMet vriendelijke groet,\nHet evenement team!"
            })


        // Check of de rank er is en/of het misschien een staff rank is!
        if (message.member.roles.cache.some(role => role.id === eventRole) || // Event role
            message.member.roles.cache.some(role => role.id === config["mod-role-id"]) || // Mod role
            message.member.roles.cache.some(role => role.id === config["admin-role-id"]) || // Admin role
            message.member.roles.cache.some(role => role.id === config["owner-role-id"])) // Owner role
        {
            if (type == "add") {
                if (user.roles.cache.some(role => role.id === eventWinner)) return message.reply("Deze user heeft al de event winnaar role!");
                user.send({embeds: [winnerEmbed]}).catch(error => {
                    console.log("Kon message niet geven aan de event winnaar. reden:"+ error)
                })
                message.reply("Event winnaar rank geadd!")
                user.roles.add(eventWinner);
            } else if (type == "delete" || type == "remove") {
                if (!user.roles.cache.some(role => role.id === eventWinner)) return message.reply("Deze user heeft niet de event winnaar role!");
                user.send({embeds: [removeEmbed]}).catch(error => {
                    console.log("Kon message niet geven dat de rank was geremovded. Reden:"+ error)
                })
                user.roles.remove(eventWinner);
            } else {
                message.reply(`Wil je een Winnaar rank adden of removen want ${type} werkt niet echt met mij...`)
            }
            // Al heb je 1 van die ranks hierboven niet!
        } else {
            message.reply("Je hebt geen toegang om deze command te gebruiken!")
        }
    }
})