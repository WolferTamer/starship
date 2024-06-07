import 'dotenv/config'
import { Client } from 'discord.js'

const client = new Client({
intents: ['Guilds', 'GuildMessages', 'GuildMembers']
})

client.on('ready', (c)=> {
    console.log(`${c.user.username} is online`);
})
client.login(process.env.TOKEN)