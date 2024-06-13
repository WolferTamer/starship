import { Client, CommandInteraction, Events, Interaction } from "discord.js";
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

        
        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        //Save the profile so as to register any new values with defaults
        profileData.save();

        if(profileData.pet > -1) {
            const petPost = petPostFix(profileData)
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