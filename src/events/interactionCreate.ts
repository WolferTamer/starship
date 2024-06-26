import { Client, CommandInteraction, Events, Interaction, Collection } from "discord.js";
const petPostFix =require( '../utils/petPostFix')
const UserModel = require('../utils/schema')
//Gets called whenever an interaction (command) occurs.

module.exports = {
	name: Events.InteractionCreate,
	once: false,
	async execute(interaction: Interaction) {
        //If it isnt a slash command, return.
		if (!interaction.isChatInputCommand()) return;

        let prefix = "";
        let postfix = ""
        let profileData;

        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        const {cooldowns} = interaction.client
        if(!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name);
        const defaultCooldown = 5;
        const cooldownAmount = (command.cooldown ?? defaultCooldown) * 1_000;

        if(timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount
            if(now < expirationTime) {
                const expiredTimestamp = Math.round(expirationTime / 1_000)
                return interaction.reply({content: `You can use ${command.data.name} again <t:${expiredTimestamp}:R>.`})
            }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id),cooldownAmount)
            

        //Grab the user's data from the database. If none exist then create it and add a prefix for it.
        try{
            profileData = await UserModel.findOne({userid:interaction.user.id});
            if(!profileData) {
                let profile = await UserModel.create({
                    userid: interaction.user.id
                });
                profile.save();
                profileData = await UserModel.findOne({userid:interaction.user.id});
                prefix += "A user profile was created in our database. If you already should have had user data, please contact support \n"
            }
        } catch (e) {
            console.log(e)
        }

        

        //Save the profile so as to register any new values with defaults
        profileData.save();

        if(profileData.pet > -1) {
            const petPost = await petPostFix(profileData)
            if(petPost) {
                postfix += '\n'+ petPost + '\n'
            }
        }

        try {
            //Try running the command. Respond using the return value
            //Also add a prefix and postfix, which will be added before/after the response respectively.
            await command.execute(interaction, profileData);
            let response = prefix;
            response += postfix;
            if(response !== "") {interaction.channel?.send(response);}
            
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
	},
};