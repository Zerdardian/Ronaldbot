const Event = require("../structures/Event.js")

// Module moet bestaan uit antispam.
// Message mag niet het zelfde zijn als de volgende

module.exports = new Event("messageCreate", (client, message) => {
    console.log(message.content)
})