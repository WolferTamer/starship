import { ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, SlashCommandBuilder, SlashCommandUserOption } from "discord.js";
const UserModel = require('../../utils/schema')
import * as pets from '../../../data/pets.json'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('buypet')
		.setDescription('Buy a pet from the pet store!')
        .addStringOption((option)=>option.setName('pet').setDescription('The name of the pet you wish to buy')
            .setRequired(true)),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {
        const petName = interaction.options.getString('pet')!.toLowerCase()
        const index = pets.pets.findIndex((obj) => obj.name.toLowerCase() === petName)
        const owned = profileData.pets.findIndex((obj : any) => obj.petid == index)


        if(index < 0) {
            interaction.reply(`The pet ${petName} does not exist.`)
            return;
        } else if (pets.pets[index].badge > profileData.badgetier){
            interaction.reply(`You don't have a high enough badge tier to buy ${petName}.`)
            return;
        }  else if (profileData.balance < pets.pets[index].cost) {
            interaction.reply(`You don't have enough money to buy ${petName}.`)
            return;
        } else if(owned >= 0) {
            interaction.reply( `You already own a ${petName}`)
            return;
        }


		let embed = new EmbedBuilder()
            .setTitle(`Pet Bought ${pets.pets[index].icon}`)
            .setColor(0x0565ff)
            .setDescription(`Congratulations, you bought a ${petName}!`)
    
        let newPet = {
            petid:index,
            petname:pets.pets[index].name
        }
        const response2 = await UserModel.findOneAndUpdate({
            userid: interaction.user.id
        }, {
            $push: {pets:newPet},
            $inc: {balance:-pets.pets[index].cost}
        });
        
		interaction.reply({embeds:[embed]});
	},
};