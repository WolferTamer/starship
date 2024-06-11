import { Client, CommandInteraction, Events, Interaction } from "discord.js";
import * as mongoose from 'mongoose'
const UserModel = require('../utils/schema')

module.exports = {
	name: Events.InteractionCreate,
	once: true,
	async execute(interaction: Interaction) {
		if (!interaction.isChatInputCommand()) return;
        let prefix = "";
        let postfix = ""
        let profileData;
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

        try {
            let response = prefix;
            response += await command.execute(interaction, profileData);
            response += postfix;
            interaction.reply(response);
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