if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
import * as mongoose from 'mongoose'
import { Client, Collection, Events, IntentsBitField } from "discord.js";


//set the intents for the bot. these are specific permissions for each server.
const client = new Client({
intents: [
    IntentsBitField.Flags.Guilds, 
    IntentsBitField.Flags.GuildMembers, 
    IntentsBitField.Flags.GuildMessages]
})

//Create a commands/events collection for the client, this allows you to access the lists from anywhere.
client.commands = new Collection()
client.events = new Collection()
client.cooldowns = new Collection()


//Once the bot is logged in, go though the event and command handlers to register each
client.on('ready', () => {

    ['command_handler', 'event_handler'].forEach(handler => {
        require(`./handlers/${handler}`)(client);
    })
})

//Connect to the database
mongoose.connect(process.env.MONGODB_SRV!).then(async()=> {
    console.log('Connected to the database!');
}).catch((err)=> {
    console.log(err);
});

client.login(process.env.TOKEN)