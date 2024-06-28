import { ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, SlashCommandBuilder, SlashCommandUserOption } from "discord.js";
const UserModel = require('../../utils/schema')
import pets from '../../../data/pets.json'
import {admins} from '../../../config.json'

module.exports = {
    embed: new EmbedBuilder()
    .setTitle('givepet')
    .setDescription('Only admins can use this command to cheat in a pet for a particular player')
    .setFields([{name:'[Pet]',value:'The name of the pet you want to cheat in.'},
        {name:'{User}',value:'The user you want to give the pet to. By default it gives it to the player using the command.'}
    ]),
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
                    interaction.reply({content:"This user has not used this bot and does not have a profile.",ephemeral:true})
                    return;
                } 
            } catch (e) {
                console.log(e)
                interaction.reply({content:"An error occured. please try again.",ephemeral:true})
                return;
            }
        }
        if(index < 0) {
            interaction.reply({content:`The pet ${petName} does not exist.`,ephemeral:true})
            return;
        } else if (!isAdmin){
            interaction.reply({content:`You are not an admin.`,ephemeral:true})
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
            interaction.reply({content:'An error occured. please try again.',ephemeral:true})
            return;
        }
        let embed = new EmbedBuilder()
            .setTitle(`${interaction.user.displayName} Gave A Pet to ${recipient?.displayName ?? 'Themselves'}`)
            .setDescription(`1 x ${pets.pets[index].icon} ${pets.pets[index].name}`)
            .setColor(0x45cf3e)
        
		interaction.reply({embeds:[embed]});
	},
};