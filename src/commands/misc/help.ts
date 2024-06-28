import { ActionRow, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, EmbedBuilder, SlashCommandBuilder } from "discord.js";
const path = require('node:path');
const fs = require('node:fs');

module.exports = {
    embed: new EmbedBuilder()
    .setTitle('help')
    .setDescription('That\'s this command. Shows a list of all commands or details of a specific one.')
    .setFields([{name:'{Command}',value:'The name of the command you want to view.'}]),
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Get the explanation of a certain command or a list of all commands!')
        .addStringOption((option) => option.setName('command').setDescription('the command name').setRequired(false)),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {
        const commandName = interaction.options.getString('command')
        let embed = new EmbedBuilder()
        const foldersPath = path.join(__dirname, '../');
        const commandFolders = fs.readdirSync(foldersPath);

        if(commandName) {
            
            //Goes through every subfolder in src/commands/ and adds it to the list. 
            for (const folder of commandFolders) {
                const commandsPath = path.join(foldersPath, folder);
                const commandFiles = fs.readdirSync(commandsPath).filter((file: any) => file.endsWith('.js') || file.endsWith('.ts'));
                for (const file of commandFiles) {
                    const filePath = path.join(commandsPath, file);
                    const command = require(filePath);
                    // Set a new item in the Collection with the key as the command name and the value as the exported module
                    if ('embed' in command && command.data.name === commandName) {
                        embed = command.embed.setColor(0xFFFF00)
                        interaction.reply({embeds:[embed]})
                        return;
                    } else if (command.data.name === commandName) {
                        embed.setTitle(command.data.name)
                        .setDescription(command.data.description)
                        .setColor(0xFFFF00)
                        for(let option of command.data.options) {
                            embed.addFields([{name:`${option.name}`,value:`Required: ${option.required}\nDescription: ${option.description}`}])
                        }
                        interaction.reply({embeds:[embed]})
                        return;
                    }
                }
            }
        } else {
            embed.setTitle(`Commands`)
            embed.setColor(0xFFFF00)
            for (const folder of commandFolders) {
                const commandsPath = path.join(foldersPath, folder);
                const commandFiles = fs.readdirSync(commandsPath).filter((file: any) => file.endsWith('.js') || file.endsWith('.ts'));
                let text = ''
                for (const file of commandFiles) {
                    const filePath = path.join(commandsPath, file);
                    const command = require(filePath);
                    text +=`\`${command.data.name}\` `
                }
                embed.addFields([{name:folder,value:text}])
            }
            interaction.reply({embeds:[embed]})
            return;
        }
    }
}