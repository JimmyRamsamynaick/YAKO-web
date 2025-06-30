require("dotenv").config();
const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
const PORT = 3000;

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.login(process.env.DISCORD_TOKEN);

client.on("ready", () => {
    console.log(`Connecté en tant que ${client.user.tag}`);
});

app.get("/api/stats", async (req, res) => {
    try {
        const guildCount = client.guilds.cache.size;
        const guilds = await Promise.all(client.guilds.cache.map(g => g.fetch()));
        const memberCount = guilds.reduce((acc, g) => acc + g.memberCount, 0);
        const uptime = (client.uptime / 1000 / 60 / 60).toFixed(1);
        res.json({
            servers: guildCount,
            users: memberCount,
            uptime
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

app.listen(PORT, () => console.log(`API sur http://localhost:${PORT}`));
