import { Client, REST, Routes } from "discord.js";
const fs = require('node:fs');
const path = require('node:path');
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}


module.exports = async (client: Client) => {
    let commands: any = [];

    const foldersPath = path.join(__dirname, '../commands');
    const commandFolders = fs.readdirSync(foldersPath);
    
    //Goes through every subfolder in src/commands/ and adds it to the list. 
    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter((file: any) => file.endsWith('.js') || file.endsWith('.ts'));
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            // Set a new item in the Collection with the key as the command name and the value as the exported module
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                commands.push(command.data.toJSON());
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }

    const rest = new REST().setToken(process.env.TOKEN!);

    // and deploy your commands!
    //Registers both the application and guild commands. Guild commands are registered in a specific server.
    (async () => {
        try {
            console.log(`Started refreshing ${commands.length} application (/) commands.`);

            // The put method is used to fully refresh all commands in the guild with the current set
            const data : any = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT!, process.env.GUILD!),
                { body: commands },
            );
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT!),
                { body: commands },
            );

            console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
            // And of course, make sure you catch and log any errors!
            console.error(error);
        }
    })();
};