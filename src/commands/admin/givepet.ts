import { ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, SlashCommandBuilder, SlashCommandUserOption } from "discord.js";
const UserModel = require('../../utils/schema')
import * as pets from '../../../data/pets.json'
import {admins} from '../../../config.json'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('givepet')
		.setDescription('Admin command to give yourself a pet!')
        .addStringOption((option)=>option.setName('pet').setDescription('The pet you wish to get')
            .setRequired(true))
        .addUserOption((option) => option.setName('user').setDescription('The user you want to give an item to (yourself by default)')
            .setRequired(false)),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {
        const petName = interaction.options.getString('pet')!.toLowerCase()
        const recipient = interaction.options.getUser('user')
        const index = pets.pets.findIndex((obj) => obj.name.toLowerCase() === petName)
        const isAdmin = admins.findIndex((item) => item === interaction.user.id) >= 0

        if(recipient) {
            try{
                profileData = await UserModel.findOne({userid:recipient.id});
                if(!profileData) {
                    interaction.reply("This user has not used this bot and does not have a profile.")
                    return;
                } 
            } catch (e) {
                console.log(e)
                interaction.reply("An error occured. please try again.")
                return;
            }
        }
        if(index < 0) {
            interaction.reply(`The pet ${petName} does not exist.`)
            return;
        } else if (!isAdmin){
            interaction.reply(`You are not an admin.`)
            return;
        }

        let newPet = {
            petid:index,
            petname:pets.pets[index].name
        }
		
        try {
            const response = await UserModel.findOneAndUpdate({
                userid: profileData.userid
            }, {
                $push: {pets:newPet}
            });
        } catch(e) {
            console.log(e);
            interaction.reply('An error occured. please try again.')
            return;
        }
        
		interaction.reply(`${interaction.user} gave ${recipient ?? 'themselves'} a ${petName}`);
	},
};