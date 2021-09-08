const Event = require("../structures/Event.js")

// Bot is ready voor gebruik!
module.exports = new Event("ready", (client) => {
    console.log("Bot is ready!")

    client.user.setActivity("being a Nerd!", {
        type: "STREAMING",
        url: "https://www.twitch.tv/zerdardian"
      });
});