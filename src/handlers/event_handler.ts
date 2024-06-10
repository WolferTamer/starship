import { Client } from "discord.js";
const fs = require('node:fs');
const path = require('node:path');
import 'dotenv/config'


module.exports = async (client: Client) => {
    const eventsPath = path.join(__dirname, '../events');
    const eventFiles = fs.readdirSync(eventsPath).filter((file:any) => file.endsWith('.js') || file.endsWith('ts'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
};