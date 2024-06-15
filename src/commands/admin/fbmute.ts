import { ChatInputCommandInteraction, ColorResolvable, CommandInteraction, EmbedBuilder, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandNumberOption, TextChannel } from "discord.js";
import {admins} from '../../../config.json'
const UserModel = require('../../utils/schema')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('fbmute')
		.setDescription('Mute an individual from sending feedback!')
        .addUserOption((option) => option.setName('user').setDescription('The user you want to give an item to (yourself by default)')
            .setRequired(true)),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {
        const isAdmin = admins.findIndex((item) => item === interaction.user.id) >= 0
        const recipient = interaction.options.getUser('user')!

        if(!isAdmin) {
            interaction.reply({content:"You are not an admin",ephemeral:true})
            return;
        }

        if(recipient) {
            try{
                profileData = await UserModel.findOne({userid:recipient.id});
                if(!profileData) {
                    interaction.reply({content:"This user has not used this bot and does not have a profile.",ephemeral:true})
                    return;
                } 
            } catch (e) {
                console.log(e)
                interaction.reply({content:"An error occured. please try again.",ephemeral:true})
                return;
            }
        }
        const isMuted = profileData.muted

        let text = `User with id ${profileData.userid} has been `
        if(isMuted) {
            text+='unmuted.';
        } else {
            text+='muted.';
        }

        try {
            const response = await UserModel.findOneAndUpdate({
                userid: profileData.userid
            }, {
                $set: {muted:!isMuted}
            });
        } catch(e) {
            console.log(e);
            interaction.reply({content:'An error occured. please try again.',ephemeral:true})
            return;
        }

		interaction.reply(text);
	},
};