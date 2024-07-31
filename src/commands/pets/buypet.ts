import { ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, SlashCommandBuilder, SlashCommandUserOption } from "discord.js";
const UserModel = require('../../utils/schema')
import * as pets from '../../../data/pets.json'

module.exports = {
    embed: new EmbedBuilder()
    .setTitle('buypet')
    .setDescription('Buy one of the pets available in the petstore.')
    .setFields([{name:'[Pet]',value:'The pet that you would like to buy.'}]),
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
            interaction.reply({content:`The pet ${petName} does not exist.`,ephemeral:true})
            return;
        } else if (pets.pets[index].badge > profileData.chosenbadge){
            interaction.reply({content:`You don't have a high enough rank to buy ${petName}.`,ephemeral:true})
            return;
        }  else if (profileData.balance < pets.pets[index].cost) {
            interaction.reply({content:`You don't have enough money to buy ${petName}.`,ephemeral:true})
            return;
        } else if(owned >= 0) {
            interaction.reply({content:`You already own a ${petName}`,ephemeral:true})
            return;
        }


		let embed = new EmbedBuilder()
            .setTitle(`Pet Bought ${interaction.client.emojis.cache.get(pets.pets[index].icon)}`)
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