import 'dotenv/config'
import { Client, Collection, Events, IntentsBitField } from "discord.js";

const client = new Client({
intents: [
    IntentsBitField.Flags.Guilds, 
    IntentsBitField.Flags.GuildMembers, 
    IntentsBitField.Flags.GuildMessages]
})

client.commands = new Collection()
client.events = new Collection()

client.on('ready', () => {

    ['command_handler', 'event_handler'].forEach(handler => {
        require(`./handlers/${handler}`)(client);
    })
})

client.login(process.env.TOKEN)