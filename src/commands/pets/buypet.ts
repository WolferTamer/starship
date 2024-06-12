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

        if(index < 0) {
            return {text:`The pet ${petName} does not exist.`}
        } else if (pets.pets[index].badge > profileData.badgetier){
            return {text:`You don't have a high enough badge tier to buy ${petName}.`}
        }  else if (profileData.balance < pets.pets[index].cost) {
            return {text:`You don't have enough money to buy ${petName}.`}
        } else if (profileData.pet == index) {
            return {text:`You already own ${petName}.`}
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
        
		return {text:``,embeds:[embed]};
	},
};